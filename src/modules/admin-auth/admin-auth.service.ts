import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { name, email, password } = signUpDto;

    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { message: 'Admin created successfully' };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    const token = this.jwtService.sign(payload);

    const { password: _, ...adminData } = admin;

    return {
      user: adminData,
      token,
      message: 'Login successful',
    };
  }

  async validateUser(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid token');
    }

    return admin;
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const admin = await this.prisma.admin.update({
      where: { id },
      data: updateProfileDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { user: admin, message: 'Profile updated successfully' };
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.admin.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }
}