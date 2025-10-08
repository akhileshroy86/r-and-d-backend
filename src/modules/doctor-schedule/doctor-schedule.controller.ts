import { Controller, Get, Post, Body, Param, Query, Put, UseGuards } from '@nestjs/common';
import { DoctorScheduleService } from './doctor-schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';

@Controller('doctor-schedule')
@UseGuards(JwtAuthGuard)
export class DoctorScheduleController {
  constructor(private readonly scheduleService: DoctorScheduleService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.scheduleService.findByDoctor(doctorId);
  }

  @Put('doctor/:doctorId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  update(
    @Param('doctorId') doctorId: string,
    @Body() updateData: Partial<CreateScheduleDto>,
  ) {
    return this.scheduleService.update(doctorId, updateData);
  }

  @Get('slots/:doctorId')
  getAvailableSlots(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.getAvailableSlots(doctorId, new Date(date));
  }

  @Get('availability/:doctorId')
  checkAvailability(
    @Param('doctorId') doctorId: string,
    @Query('dateTime') dateTime: string,
  ) {
    return this.scheduleService.isDoctorAvailable(doctorId, new Date(dateTime));
  }
}
