import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createDoctorDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingLicense = await this.prisma.doctor.findUnique({
      where: { licenseNumber: createDoctorDto.licenseNumber },
    });

    if (existingLicense) {
      throw new ConflictException('Doctor with this license number already exists');
    }

    const hashedPassword = await bcrypt.hash(createDoctorDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createDoctorDto.email,
        password: hashedPassword,
        role: UserRole.DOCTOR,
        doctor: {
          create: {
            firstName: createDoctorDto.firstName,
            lastName: createDoctorDto.lastName,
            specialization: createDoctorDto.specialization,
            qualification: createDoctorDto.qualification,
            licenseNumber: createDoctorDto.licenseNumber,
            phone: createDoctorDto.phone,
          },
        },
      },
      include: {
        doctor: true,
      },
    });
  }

  async findAll() {
    return this.prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }
}