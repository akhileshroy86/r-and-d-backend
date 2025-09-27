import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    phone: string;
  }) {
    return this.prisma.doctor.create({
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
    return this.prisma.doctor.findMany({
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
            patient: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.doctor.findUnique({
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
            patient: true,
          },
        },
      },
    });
  }
}