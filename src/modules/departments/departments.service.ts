import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: createDepartmentDto,
    });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        hospital: true,
        doctors: true,
        symptoms: true,
        _count: {
          select: { doctors: true },
        },
      },
    });
  }

  async findByHospital(hospitalId: string) {
    return this.prisma.department.findMany({
      where: { hospitalId },
      include: {
        doctors: true,
        symptoms: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: {
        hospital: true,
        doctors: true,
        symptoms: true,
      },
    });
  }

  async suggestBySymptoms(symptoms: string[]) {
    const departments = await this.prisma.department.findMany({
      include: {
        symptoms: true,
        doctors: true,
      },
    });

    // Simple keyword matching - can be enhanced with AI
    const matches = departments.filter(dept => 
      dept.symptoms.some(symptom => 
        (Array.isArray(symptom.keywords) ? symptom.keywords : []).some(keyword => 
          symptoms.some(userSymptom => 
            userSymptom.toLowerCase().includes(keyword.trim().toLowerCase())
          )
        )
      )
    );

    return matches.length > 0 ? matches : departments.slice(0, 3);
  }
}
