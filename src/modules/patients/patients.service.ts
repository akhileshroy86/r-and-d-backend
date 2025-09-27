import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phone: string;
    address?: string;
  }) {
    return this.prisma.patient.create({
      data,
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
        appointments: {
          include: {
            doctor: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        appointments: {
          include: {
            doctor: true,
          },
        },
      },
    });
  }
}