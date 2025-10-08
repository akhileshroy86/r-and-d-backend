import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class SymptomsService {
  constructor(private prisma: PrismaService) {}

  private readonly symptomMapping = {
    'fever': 'General Medicine',
    'cough': 'Pulmonology',
    'skin rash': 'Dermatology',
    'headache': 'Neurology',
    'chest pain': 'Cardiology',
    'stomach pain': 'Gastroenterology',
    'joint pain': 'Orthopedics',
    'eye pain': 'Ophthalmology',
    'ear pain': 'ENT',
    'throat pain': 'ENT',
    'back pain': 'Orthopedics',
    'breathing difficulty': 'Pulmonology',
    'heart palpitations': 'Cardiology',
    'nausea': 'Gastroenterology',
    'dizziness': 'Neurology'
  };

  async analyze(symptoms: string) {
    const symptomList = symptoms.toLowerCase().split(',').map(s => s.trim());
    const departments = new Set<string>();
    
    symptomList.forEach(symptom => {
      const department = this.symptomMapping[symptom];
      if (department) {
        departments.add(department);
      }
    });

    if (departments.size === 0) {
      return { departments: [], doctors: [] };
    }

    const doctors = await this.prisma.doctor.findMany({
      where: {
        department: {
          in: Array.from(departments)
        }
      },
      select: {
        id: true,
        name: true,
        specialization: true,
        rating: true,
        consultationFee: true,
        schedule: {
          select: {
            availableDays: true,
            startTime: true,
            endTime: true
          }
        }
      }
    });

    return {
      departments: Array.from(departments),
      doctors: doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        rating: doctor.rating,
        fee: doctor.consultationFee,
        availability: doctor.schedule ? {
          days: doctor.schedule.availableDays,
          startTime: doctor.schedule.startTime,
          endTime: doctor.schedule.endTime
        } : null
      }))
    };
  }
}