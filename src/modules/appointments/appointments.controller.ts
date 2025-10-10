import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { AppointmentStatus } from '../../common/constants/enums';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('/test')
  test(@Body() body: any) {
    return { message: 'Test endpoint working', data: body };
  }

  @Post('/simple')
  async createSimple(@Body() body: any) {
    try {
      console.log('Simple appointment creation:', body);
      
      const result = await this.appointmentsService.create({
        patientId: 'temp_patient_id',
        doctorId: body.doctorId || 'test_doctor_id',
        date: body.date || new Date().toISOString(),
        timeRange: body.timeSlot || '10:00 AM - 10:30 AM',
        notes: body.symptoms || 'Test appointment'
      });
      
      return result;
    } catch (error) {
      console.error('Simple appointment error:', error);
      return { success: false, error: error.message };
    }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      console.log('=== APPOINTMENT CONTROLLER START ===');
      console.log('Raw body received:', JSON.stringify(body, null, 2));
      console.log('Body keys:', Object.keys(body || {}));
      
      // Map frontend fields to backend expected format
      const appointmentData = {
        patientId: body.patientId || 'temp_patient_id', // Temporary for testing
        doctorId: body.doctorId,
        date: body.date,
        timeRange: body.timeSlot || body.timeRange,
        duration: body.duration || 30,
        notes: body.symptoms || body.notes || '',
      };
      
      console.log('Mapped appointment data:', JSON.stringify(appointmentData, null, 2));
      
      const result = await this.appointmentsService.create(appointmentData);
      
      console.log('=== APPOINTMENT CONTROLLER SUCCESS ===');
      return result;
    } catch (error) {
      console.error('=== APPOINTMENT CONTROLLER ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      return {
        success: false,
        error: error.message,
        details: 'Check server logs for more information'
      };
    }
  }

  @Get()
  findAll(
    @Query('status') status?: AppointmentStatus,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.appointmentsService.findAll(status, doctorId, patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/payment/create-order')
  createPaymentOrder(@Param('id') appointmentId: string) {
    return this.appointmentsService.createRazorpayOrder(appointmentId);
  }

  @Post(':id/payment/verify')
  verifyPayment(
    @Param('id') appointmentId: string,
    @Body() body: { razorpayPaymentId: string; razorpaySignature: string }
  ) {
    return this.appointmentsService.verifyPayment(
      appointmentId,
      body.razorpayPaymentId,
      body.razorpaySignature
    );
  }
}
