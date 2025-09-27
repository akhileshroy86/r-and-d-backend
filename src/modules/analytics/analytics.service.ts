import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.doctor.count(),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: {
          dateTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
    };
  }

  async getAppointmentsByStatus() {
    const appointments = await this.prisma.appointment.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    return appointments.map(item => ({
      status: item.status,
      count: item._count.status,
    }));
  }

  async getMonthlyAppointments() {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
        },
      },
      select: {
        dateTime: true,
      },
    });

    // Group by month
    const monthlyData = appointments.reduce((acc, appointment) => {
      const month = appointment.dateTime.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
    }));
  }
}