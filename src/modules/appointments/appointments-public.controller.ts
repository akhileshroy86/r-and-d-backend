import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments-public')
export class AppointmentsPublicController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async getAppointments(@Query('patientId') patientId?: string) {
    try {
      const appointments = await this.appointmentsService.findAll(undefined, undefined, patientId);
      return appointments;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('test')
  test() {
    return { message: 'Public appointments endpoint working' };
  }

  @Post()
  async create(@Body() body: any) {
    try {
      console.log('Public appointment creation:', body);
      
      // Test database connection first
      const testQuery = await this.appointmentsService['prisma'].$queryRaw`SELECT 1 as test`;
      console.log('Database connection test:', testQuery);
      
      const result = await this.appointmentsService.create(body);
      console.log('Appointment creation result:', result);
      return result;
    } catch (error) {
      console.error('Public appointment error:', error);
      console.error('Error stack:', error.stack);
      return { error: error.message, stack: error.stack };
    }
  }

  @Post('simple')
  async createSimple(@Body() body: any) {
    try {
      console.log('Simple appointment creation:', body);
      
      // First get available doctors and patients
      const doctors = await this.appointmentsService['prisma'].doctor.findMany({ take: 1 });
      const patients = await this.appointmentsService['prisma'].patient.findMany({ take: 1 });
      
      console.log('Available doctors:', doctors.length);
      console.log('Available patients:', patients.length);
      
      if (doctors.length === 0 || patients.length === 0) {
        return { error: 'No doctors or patients found in database' };
      }
      
      // Create appointment with explicit transaction
      const result = await this.appointmentsService['prisma'].$transaction(async (tx) => {
        const appointment = await tx.appointment.create({
          data: {
            patientId: patients[0].id,
            doctorId: doctors[0].id,
            dateTime: new Date(body.date || '2024-01-15'),
            timeRange: body.timeRange || '10:00-11:00',
            duration: 30
          }
        });
        
        console.log('Appointment created in transaction:', appointment.id);
        return appointment;
      });
      
      // Verify it was saved
      const saved = await this.appointmentsService['prisma'].appointment.findUnique({
        where: { id: result.id }
      });
      
      console.log('Appointment verification:', saved ? 'FOUND' : 'NOT FOUND');
      
      return { ...result, verified: !!saved };
    } catch (error) {
      console.error('Simple appointment error:', error);
      return { error: error.message };
    }
  }
}