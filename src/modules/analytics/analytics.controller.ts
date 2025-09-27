import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('appointments-by-status')
  async getAppointmentsByStatus() {
    return this.analyticsService.getAppointmentsByStatus();
  }

  @Get('monthly-appointments')
  async getMonthlyAppointments() {
    return this.analyticsService.getMonthlyAppointments();
  }
}