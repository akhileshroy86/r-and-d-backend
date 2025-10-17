import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UserRole } from '../../common/constants/enums';

@Injectable()
export class DoctorsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    // Auto-generate name if not provided
    const doctorName = `Dr. ${createDoctorDto.firstName} ${createDoctorDto.lastName}`;
    
    // Set default values
    const doctorData = {
      ...createDoctorDto,
      name: doctorName,
      department: createDoctorDto.specialization, // Use specialization as department
      experience: createDoctorDto.experience || 0,
      consultationFee: createDoctorDto.consultationFee || 0,
    };

    // Create user first
    const user = await this.usersService.create({
      email: `${createDoctorDto.firstName.toLowerCase()}.${createDoctorDto.lastName.toLowerCase()}@hospital.com`,
      password: 'temp123',
      role: UserRole.DOCTOR,
    });

    // Create doctor with default schedule
    const doctor = await this.prisma.doctor.create({
      data: {
        userId: user.id,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        name: doctorData.name,
        qualification: doctorData.qualification,
        specialization: doctorData.specialization,
        department: doctorData.department,
        experience: doctorData.experience,
        consultationFee: doctorData.consultationFee,
        departmentId: doctorData.departmentId,
        hospitalId: doctorData.hospitalId,
        schedule: {
          create: {
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            startTime: '09:00',
            endTime: '17:00',
            lunchBreakStart: '13:00',
            lunchBreakEnd: '14:00',
            consultationDuration: 30,
            maxPatientsPerDay: 20,
          },
        },
      },
      include: {
        schedule: true,
      },
    });

    return {
      message: 'Doctor created successfully',
      doctor,
    };
  }

  async findAll() {
    return this.prisma.doctor.findMany({
      include: {
        schedule: true,
      },
    });
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        schedule: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);

    const updatedDoctor = await this.prisma.doctor.update({
      where: { id },
      data: updateDoctorDto,
      include: {
        schedule: true,
      },
    });

    return {
      message: 'Doctor updated successfully',
      doctor: updatedDoctor,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    
    await this.prisma.doctor.delete({
      where: { id },
    });

    return {
      message: 'Doctor deleted successfully',
    };
  }
}