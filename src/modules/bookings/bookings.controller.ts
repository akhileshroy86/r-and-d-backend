import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getStats() {
    return this.bookingsService.getBookingStats();
  }

  @Get('booking-id/:bookingId')
  findByBookingId(@Param('bookingId') bookingId: string) {
    return this.bookingsService.findByBookingId(bookingId);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.bookingsService.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
  ) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Patch(':bookingId/enable-rejoin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCTOR)
  enableRejoin(@Param('bookingId') bookingId: string) {
    return this.bookingsService.enableRejoin(bookingId);
  }

  @Post('walk-in')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STAFF)
  createWalkIn(
    @Body('patientId') patientId: string,
    @Body('doctorId') doctorId: string,
    @Body('timeRange') timeRange: string,
  ) {
    return this.bookingsService.createWalkInBooking(patientId, doctorId, timeRange);
  }
}
