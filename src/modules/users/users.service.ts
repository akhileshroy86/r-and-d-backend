import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    console.log('🔍 Creating user with data:', createUserDto);
    
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      console.log('❌ User already exists:', createUserDto.email);
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    console.log('🔐 Password hashed successfully');

    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    console.log('✅ User created successfully:', newUser);
    return newUser;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        patient: true
      }
    });
  }

  async createPatientRecord(userId: string, patientData: any) {
    console.log('🏥 Creating patient record for user:', userId);
    
    const patient = await this.prisma.patient.create({
      data: {
        userId,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        phone: patientData.phone,
        dateOfBirth: new Date(patientData.dateOfBirth),
        address: patientData.address
      }
    });
    
    console.log('✅ Patient record created:', patient.id);
    return patient;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async updatePassword(userId: string, hashedPassword: string) {
    console.log('🔐 Updating password for user:', userId);
    const result = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    console.log('✅ Password updated in user table');
    return result;
  }

  async updatePasswordWithPlainText(userId: string, plainPassword: string) {
    console.log('🔐 Updating password with plain text for user:', userId);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const result = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    console.log('✅ Password hashed and updated in user table');
    return result;
  }

  async findStaffByEmail(email: string) {
    return this.prisma.staff.findFirst({
      where: { email },
      include: { user: true }
    });
  }

  async getAllStaff() {
    return this.prisma.staff.findMany({
      include: { user: true }
    });
  }

  async updateStaffPassword(staffId: string, plainPassword: string) {
    return this.prisma.staff.update({
      where: { id: staffId },
      data: { password: plainPassword }
    });
  }

  async findAllStaff() {
    return this.prisma.staff.findMany({
      include: { user: true }
    });
  }

  async findStaffByEmailDirect(email: string) {
    return this.prisma.staff.findFirst({
      where: { email }
    });
  }

  async updateStaffPasswordDirect(staffId: string, newPassword: string) {
    console.log('🔐 Updating staff password for staff:', staffId);
    const result = await this.prisma.staff.update({
      where: { id: staffId },
      data: { password: newPassword }
    });
    console.log('✅ Password updated in staff table');
    return result;
  }

  async updateStaffPasswordComplete(email: string, newPassword: string) {
    console.log('🔐 Complete staff password update for:', email);
    
    // Find staff record with user relation
    const staff = await this.prisma.staff.findFirst({
      where: { email },
      include: { user: true }
    });
    
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    
    console.log('📝 Found staff:', staff.fullName, 'with userId:', staff.userId);
    
    // Update staff table with plain text password
    await this.prisma.staff.update({
      where: { id: staff.id },
      data: { password: newPassword }
    });
    console.log('✅ Staff table updated with new password');
    
    // Update user table with hashed password
    const hashedPassword = await this.hashPassword(newPassword);
    await this.prisma.user.update({
      where: { id: staff.userId },
      data: { password: hashedPassword }
    });
    console.log('✅ User table updated with hashed password');
    
    // Verify the update
    const updatedStaff = await this.prisma.staff.findFirst({
      where: { email },
      include: { user: true }
    });
    
    console.log('🔍 Verification - Staff password:', updatedStaff.password);
    console.log('🔍 Verification - User password hash:', updatedStaff.user.password.substring(0, 20) + '...');
    
    return { 
      message: 'Staff password updated successfully in both tables',
      staffPassword: updatedStaff.password,
      userPasswordHash: updatedStaff.user.password.substring(0, 20) + '...'
    };
  }
}
