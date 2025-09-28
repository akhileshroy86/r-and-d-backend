import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DOCTOR)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('appointments-by-status')
  getAppointmentsByStatus() {
    return this.analyticsService.getAppointmentsByStatus();
  }

  @Get('monthly-appointments')
  getMonthlyAppointments() {
    return this.analyticsService.getMonthlyAppointments();
  }

  @Get('doctor-stats')
  getDoctorAppointmentStats() {
    return this.analyticsService.getDoctorAppointmentStats();
  }

  @Get('doctor-revenue')
  @Roles(UserRole.ADMIN)
  getDoctorRevenueStats() {
    return this.analyticsService.getDoctorRevenueStats();
  }

  @Get('payments')
  @Roles(UserRole.ADMIN)
  getPaymentAnalytics() {
    return this.analyticsService.getPaymentAnalytics();
  }

  @Get('reviews')
  getReviewAnalytics() {
    return this.analyticsService.getReviewAnalytics();
  }

  @Get('hospitals')
  @Roles(UserRole.ADMIN)
  getHospitalAnalytics() {
    return this.analyticsService.getHospitalAnalytics();
  }
}