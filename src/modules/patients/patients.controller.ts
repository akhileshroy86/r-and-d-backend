import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get('by-user/:userId')
  async getPatientByUserId(@Param('userId') userId: string) {
    try {
      const patient = await this.patientsService.findByUserId(userId);
      if (patient) {
        return {
          success: true,
          patientId: patient.id,
          patient
        };
      }
      return {
        success: false,
        message: 'Patient not found for this user'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('create-from-user')
  async createFromUser(@Body() body: any) {
    try {
      console.log('Creating patient from existing user:', body);
      
      // Check if patient already exists
      const existingPatient = await this.patientsService.findByUserId(body.id);
      if (existingPatient) {
        return {
          success: true,
          patient: existingPatient,
          message: 'Patient already exists'
        };
      }
      
      // Create patient record for existing user
      const patient = await this.patientsService.createFromExistingUser({
        userId: body.id,
        firstName: body.name?.split(' ')[0] || 'Patient',
        lastName: body.name?.split(' ').slice(1).join(' ') || 'User',
        phone: body.phone || `+91${Date.now().toString().slice(-10)}`,
        dateOfBirth: body.dateOfBirth || new Date('1990-01-01'),
        address: body.address || 'Not provided'
      });
      
      return {
        success: true,
        patient
      };
    } catch (error) {
      console.error('Error creating patient from user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }
}
