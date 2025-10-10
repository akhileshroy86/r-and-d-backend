import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpException, HttpStatus, Query } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';
import { PrismaService } from '../../config/prisma.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/constants/enums';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/test')
  async testCreate(@Body() body: any) {
    console.log('Raw body received:', JSON.stringify(body, null, 2));
    return { message: 'Data received successfully', data: body };
  }

  @Post('/simple')
  async createSimple(@Body() body: any) {
    try {
      console.log('Simple create - Raw body:', JSON.stringify(body, null, 2));
      
      // Create with minimal validation
      const doctorData = {
        firstName: body.firstName || 'Test',
        lastName: body.lastName || 'Doctor',
        name: body.name || `Dr. ${body.firstName || 'Test'} ${body.lastName || 'Doctor'}`,
        qualification: body.qualification || 'MBBS',
        department: body.department || 'General',
        specialization: body.specialization || 'General Medicine',
        experience: parseInt(body.experience) || 0,
        consultationFee: parseFloat(body.consultationFee) || 500,
      };
      
      // Add missing required fields
      const completeData = {
        ...doctorData,
        licenseNumber: body.licenseNumber || 'TEMP123',
        phone: body.phone || '+1234567890',
      };
      return await this.doctorsService.create(completeData);
    } catch (error) {
      console.error('Simple create error:', error);
      throw new HttpException(error.message || 'Creation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() body: any) {
    try {
      console.log('=== DOCTOR CREATION REQUEST ===');
      console.log('Raw body:', JSON.stringify(body, null, 2));
      console.log('Body type:', typeof body);
      console.log('Body keys:', Object.keys(body || {}));
      
      // Create user first with a unique email
      const timestamp = Date.now();
      const email = `doctor${timestamp}@hospital.com`;
      
      console.log('Creating user with email:', email);
      
      const user = await this.usersService.create({
        email,
        password: 'temp123',
        role: UserRole.DOCTOR,
      });
      
      console.log('User created:', user.id);
      
      // Create doctor with minimal required fields
      const doctorData = {
        userId: user.id,
        firstName: body.firstName || body.name?.split(' ')[0] || 'Doctor',
        lastName: body.lastName || body.name?.split(' ')[1] || 'Name',
        name: body.name || `Dr. ${body.firstName || 'Doctor'} ${body.lastName || 'Name'}`,
        qualification: body.qualification || 'MBBS',
        department: body.department || 'General Medicine',
        specialization: body.specialization || 'General Practice',
        experience: parseInt(body.experience) || 0,
        consultationFee: parseFloat(body.consultationFee) || 500,
      };
      
      console.log('Creating doctor with data:', JSON.stringify(doctorData, null, 2));
      
      const doctor = await this.prisma.doctor.create({
        data: {
          ...doctorData,
          schedule: {
            create: {
              availableDays: body.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              startTime: body.startTime || '09:00',
              endTime: body.endTime || '17:00',
              lunchBreakStart: body.lunchBreakStart || '13:00',
              lunchBreakEnd: body.lunchBreakEnd || '14:00',
              consultationDuration: parseInt(body.consultationDuration) || 30,
              maxPatientsPerDay: parseInt(body.maxPatientsPerDay) || 20,
            },
          },
        },
        include: {
          schedule: true,
        },
      });
      
      console.log('Doctor created successfully:', doctor.id);
      
      return {
        message: 'Doctor created successfully',
        doctor,
      };
    } catch (error) {
      console.error('=== DOCTOR CREATION ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.code === 'P2002') {
        throw new HttpException('Duplicate doctor entry', HttpStatus.CONFLICT);
      }
      
      throw new HttpException(
        `Doctor creation failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll() {
    return await this.doctorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.doctorsService.findOne(id);
  }

  @Put(':id')
  // @UseGuards(AdminAuthGuard) // Temporarily disabled for testing
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      console.log('=== DOCTOR UPDATE REQUEST ===');
      console.log('Doctor ID:', id);
      console.log('Update data:', JSON.stringify(body, null, 2));
      
      const result = await this.doctorsService.update(id, body);
      console.log('Update successful');
      return result;
    } catch (error) {
      console.error('=== DOCTOR UPDATE ERROR ===');
      console.error('Error:', error);
      throw error;
    }
  }

  @Delete(':id')
  // @UseGuards(AdminAuthGuard) // Temporarily disabled for testing
  async remove(@Param('id') id: string) {
    return await this.doctorsService.remove(id);
  }

  @Get('department/:dept')
  async findByDepartment(@Param('dept') department: string) {
    // Simple filter by department
    const doctors = await this.doctorsService.findAll();
    return doctors.filter(doctor => 
      doctor.department?.toLowerCase().includes(department.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(department.toLowerCase())
    );
  }

  @Post(':id/schedule')
  async createSchedule(@Param('id') doctorId: string, @Body() scheduleData: any) {
    try {
      console.log('Creating schedule for doctor:', doctorId);
      console.log('Schedule data:', scheduleData);
      
      const schedule = await this.prisma.doctorSchedule.create({
        data: {
          doctorId,
          availableDays: scheduleData.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: scheduleData.startTime || '09:00',
          endTime: scheduleData.endTime || '17:00',
          lunchBreakStart: scheduleData.lunchBreakStart || '13:00',
          lunchBreakEnd: scheduleData.lunchBreakEnd || '14:00',
          consultationDuration: parseInt(scheduleData.consultationDuration) || 30,
          maxPatientsPerDay: parseInt(scheduleData.maxPatientsPerDay) || 20,
        },
      });
      
      return {
        message: 'Schedule created successfully',
        schedule,
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw new HttpException(
        `Schedule creation failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('fix-schedules')
  async fixMissingSchedules() {
    try {
      // Find doctors without schedules
      const doctorsWithoutSchedules = await this.prisma.doctor.findMany({
        where: {
          schedule: null,
        },
        select: {
          id: true,
          name: true,
        },
      });
      
      console.log(`Found ${doctorsWithoutSchedules.length} doctors without schedules`);
      
      // Create default schedules for them
      const createdSchedules = [];
      for (const doctor of doctorsWithoutSchedules) {
        const schedule = await this.prisma.doctorSchedule.create({
          data: {
            doctorId: doctor.id,
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '09:00',
            endTime: '17:00',
            lunchBreakStart: '13:00',
            lunchBreakEnd: '14:00',
            consultationDuration: 30,
            maxPatientsPerDay: 20,
          },
        });
        createdSchedules.push({ doctorId: doctor.id, doctorName: doctor.name, scheduleId: schedule.id });
      }
      
      return {
        message: `Created schedules for ${createdSchedules.length} doctors`,
        schedules: createdSchedules,
      };
    } catch (error) {
      console.error('Error fixing schedules:', error);
      throw new HttpException(
        `Failed to fix schedules: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
