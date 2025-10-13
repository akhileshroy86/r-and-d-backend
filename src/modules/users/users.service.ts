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
}
