import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        ...createBookingDto,
        bookingId: this.generateBookingId(),
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: { firstName: true, lastName: true, phone: true },
            },
            doctor: {
              select: { firstName: true, lastName: true, specialization: true },
            },
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        appointment: {
          include: {
            patient: {
              select: { firstName: true, lastName: true, phone: true },
            },
            doctor: {
              select: { firstName: true, lastName: true, specialization: true },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
        payment: true,
        review: true,
      },
    });
  }

  async findByBookingId(bookingId: string) {
    return this.prisma.booking.findUnique({
      where: { bookingId },
      include: {
        appointment: {
          include: {
            patient: {
              select: { firstName: true, lastName: true, phone: true },
            },
            doctor: {
              select: { firstName: true, lastName: true, specialization: true },
            },
          },
        },
        payment: true,
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.booking.findMany({
      where: {
        appointment: {
          patientId,
        },
      },
      include: {
        appointment: {
          include: {
            doctor: {
              select: { firstName: true, lastName: true, specialization: true },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: BookingStatus) {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }

  async enableRejoin(bookingId: string) {
    return this.prisma.booking.update({
      where: { bookingId },
      data: { canRejoin: true },
    });
  }

  async createWalkInBooking(patientId: string, doctorId: string, timeRange: string) {
    // First create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        dateTime: new Date(),
        timeRange,
        isWalkIn: true,
        status: 'CONFIRMED',
      },
    });

    // Then create booking
    return this.create({
      appointmentId: appointment.id,
      timeRange,
    });
  }

  async getBookingStats() {
    const [total, today, pending, confirmed, cancelled] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.booking.count({
        where: { status: BookingStatus.PENDING },
      }),
      this.prisma.booking.count({
        where: { status: BookingStatus.CONFIRMED },
      }),
      this.prisma.booking.count({
        where: { status: BookingStatus.CANCELLED },
      }),
    ]);

    return {
      total,
      today,
      pending,
      confirmed,
      cancelled,
    };
  }

  private generateBookingId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BK${timestamp.slice(-6)}${random}`;
  }
}