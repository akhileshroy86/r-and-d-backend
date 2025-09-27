import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from '@prisma/client';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  async create(@Body() createAppointmentDto: {
    patientId: string;
    doctorId: string;
    dateTime: string;
    duration?: number;
    notes?: string;
  }) {
    return this.appointmentsService.create({
      ...createAppointmentDto,
      dateTime: new Date(createAppointmentDto.dateTime),
    });
  }

  @Get()
  async findAll(@Query('doctorId') doctorId?: string, @Query('patientId') patientId?: string) {
    if (doctorId) {
      return this.appointmentsService.findByDoctor(doctorId);
    }
    if (patientId) {
      return this.appointmentsService.findByPatient(patientId);
    }
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: AppointmentStatus }
  ) {
    return this.appointmentsService.updateStatus(id, updateStatusDto.status);
  }
}