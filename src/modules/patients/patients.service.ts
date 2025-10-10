import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createPatientDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createPatientDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createPatientDto.email,
        password: hashedPassword,
        role: UserRole.PATIENT,
        patient: {
          create: {
            firstName: createPatientDto.firstName,
            lastName: createPatientDto.lastName,
            dateOfBirth: new Date(createPatientDto.dateOfBirth),
            phone: createPatientDto.phone,
            address: createPatientDto.address,
          },
        },
      },
      include: {
        patient: true,
      },
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
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
    const patient = await this.prisma.patient.findUnique({
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

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }
}
