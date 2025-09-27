import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    patientId: string;
    doctorId: string;
    dateTime: Date;
    duration?: number;
    notes?: string;
  }) {
    return this.prisma.appointment.create({
      data,
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  async findByDoctor(doctorId: string) {
    return this.prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
    });
  }
}