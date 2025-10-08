import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const doctorName = createDoctorDto.name || `Dr. ${createDoctorDto.firstName} ${createDoctorDto.lastName}`;
    
    // Set default values
    const doctorData = {
      ...createDoctorDto,
      name: doctorName,
      experience: createDoctorDto.experience || 0,
      consultationFee: createDoctorDto.consultationFee || 0,
    };

    // Check for duplicate doctor
    const existingDoctor = await this.prisma.doctor.findFirst({
      where: {
        name: doctorData.name,
        department: doctorData.department,
      },
    });

    if (existingDoctor) {
      throw new ConflictException('Doctor with this name and department already exists');
    }

    // Create user first
    const user = await this.usersService.create({
      email: `${createDoctorDto.firstName.toLowerCase()}.${createDoctorDto.lastName.toLowerCase()}@hospital.com`,
      password: 'temp123',
      role: UserRole.DOCTOR,
    });

    // Create doctor with default schedule
    const doctor = await this.prisma.doctor.create({
      data: {
        ...doctorData,
        userId: user.id,
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

  async findAll(filters?: {
    department?: string;
    minFee?: number;
    maxFee?: number;
    rating?: number;
    availability?: boolean;
  }) {
    const where: any = {};
    
    if (filters?.department) {
      where.department = { contains: filters.department, mode: 'insensitive' as any };
    }
    
    if (filters?.minFee !== undefined || filters?.maxFee !== undefined) {
      where.consultationFee = {};
      if (filters.minFee !== undefined) where.consultationFee.gte = filters.minFee;
      if (filters.maxFee !== undefined) where.consultationFee.lte = filters.maxFee;
    }
    
    if (filters?.rating !== undefined) {
      where.rating = { gte: filters.rating };
    }
    
    if (filters?.availability) {
      where.schedule = { isNot: null };
    }
    
    return this.prisma.doctor.findMany({
      where,
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

  async findByDepartment(department: string) {
    return this.prisma.doctor.findMany({
      where: {
        department: {
          contains: department,
          mode: 'insensitive',
        },
      },
      include: {
        schedule: true,
      },
    });
  }
}