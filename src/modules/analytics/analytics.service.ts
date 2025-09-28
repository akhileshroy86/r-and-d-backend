import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AppointmentStatus, UserRole, PaymentStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      totalDoctors,
      totalStaff,
      totalHospitals,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      todayRevenue,
      totalRevenue,
      onlinePayments,
      offlinePayments,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.PATIENT } }),
      this.prisma.user.count({ where: { role: UserRole.DOCTOR } }),
      this.prisma.user.count({ where: { role: UserRole.STAFF } }),
      this.prisma.hospital.count(),
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: {
          dateTime: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      this.prisma.appointment.count({
        where: {
          status: AppointmentStatus.SCHEDULED,
        },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({
        where: { method: 'ONLINE', status: PaymentStatus.COMPLETED },
      }),
      this.prisma.payment.count({
        where: { method: 'OFFLINE', status: PaymentStatus.COMPLETED },
      }),
    ]);

    return {
      totalPatients,
      totalDoctors,
      totalStaff,
      totalHospitals,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      todayRevenue: todayRevenue._sum.amount || 0,
      totalRevenue: totalRevenue._sum.amount || 0,
      onlinePayments,
      offlinePayments,
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
    const currentYear = new Date().getFullYear();
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const count = await this.prisma.appointment.count({
        where: {
          dateTime: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      monthlyData.push({
        month: startDate.toLocaleString('default', { month: 'long' }),
        count,
      });
    }

    return monthlyData;
  }

  async getDoctorAppointmentStats() {
    const doctors = await this.prisma.doctor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialization: true,
        rating: true,
        totalReviews: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    return doctors.map(doctor => ({
      id: doctor.id,
      name: `${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      appointmentCount: doctor._count.appointments,
      rating: doctor.rating,
      totalReviews: doctor.totalReviews,
    }));
  }

  async getDoctorRevenueStats() {
    const doctorRevenue = await this.prisma.payment.groupBy({
      by: ['bookingId'],
      where: {
        status: PaymentStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    // Get doctor info for each booking
    const revenueWithDoctors = await Promise.all(
      doctorRevenue.map(async (revenue) => {
        const booking = await this.prisma.booking.findUnique({
          where: { id: revenue.bookingId },
          include: {
            appointment: {
              include: {
                doctor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    specialization: true,
                  },
                },
              },
            },
          },
        });

        return {
          doctor: booking?.appointment.doctor,
          revenue: revenue._sum.amount || 0,
        };
      })
    );

    // Group by doctor
    const doctorRevenueMap = new Map();
    revenueWithDoctors.forEach(({ doctor, revenue }) => {
      if (doctor) {
        const key = doctor.id;
        if (doctorRevenueMap.has(key)) {
          doctorRevenueMap.set(key, {
            ...doctorRevenueMap.get(key),
            revenue: doctorRevenueMap.get(key).revenue + revenue,
          });
        } else {
          doctorRevenueMap.set(key, {
            id: doctor.id,
            name: `${doctor.firstName} ${doctor.lastName}`,
            specialization: doctor.specialization,
            revenue,
          });
        }
      }
    });

    return Array.from(doctorRevenueMap.values());
  }

  async getPaymentAnalytics() {
    const [dailyPayments, weeklyPayments, monthlyPayments] = await Promise.all([
      this.getDailyPayments(),
      this.getWeeklyPayments(),
      this.getMonthlyPayments(),
    ]);

    return {
      daily: dailyPayments,
      weekly: weeklyPayments,
      monthly: monthlyPayments,
    };
  }

  async getReviewAnalytics() {
    const [avgRating, totalReviews, ratingDistribution] = await Promise.all([
      this.prisma.review.aggregate({
        _avg: { rating: true },
      }),
      this.prisma.review.count(),
      this.prisma.review.groupBy({
        by: ['rating'],
        _count: { rating: true },
      }),
    ]);

    return {
      averageRating: avgRating._avg.rating || 0,
      totalReviews,
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item.rating,
        count: item._count.rating,
      })),
    };
  }

  async getHospitalAnalytics() {
    const hospitals = await this.prisma.hospital.findMany({
      select: {
        id: true,
        name: true,
        rating: true,
        totalReviews: true,
        _count: {
          select: {
            doctors: true,
            departments: true,
          },
        },
      },
    });

    return hospitals.map(hospital => ({
      id: hospital.id,
      name: hospital.name,
      rating: hospital.rating,
      totalReviews: hospital.totalReviews,
      doctorCount: hospital._count.doctors,
      departmentCount: hospital._count.departments,
    }));
  }

  private async getDailyPayments() {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const revenue = await this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: date,
            lt: nextDay,
          },
        },
        _sum: { amount: true },
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        revenue: revenue._sum.amount || 0,
      });
    }
    return last7Days;
  }

  private async getWeeklyPayments() {
    const last4Weeks = [];
    for (let i = 3; i >= 0; i--) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i + 1) * 7);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      const revenue = await this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: { amount: true },
      });

      last4Weeks.push({
        week: `Week ${4 - i}`,
        revenue: revenue._sum.amount || 0,
      });
    }
    return last4Weeks;
  }

  private async getMonthlyPayments() {
    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);

      const revenue = await this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          paidAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { amount: true },
      });

      last12Months.push({
        month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        revenue: revenue._sum.amount || 0,
      });
    }
    return last12Months;
  }
}