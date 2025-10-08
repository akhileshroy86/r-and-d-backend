import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateQueueDto } from './dto/create-queue.dto';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async createQueue(createQueueDto: CreateQueueDto) {
    // Mock queue creation - in real implementation, you'd have a Queue model
    return {
      id: `queue-${Date.now()}`,
      ...createQueueDto,
      patients: [],
      currentPosition: 0,
      estimatedWaitTime: 0,
      createdAt: new Date(),
    };
  }

  async getQueues() {
    // Mock queues
    return [
      {
        id: 'queue-1',
        name: 'General Consultation',
        doctorId: 'doctor-1',
        description: 'General medical consultation queue',
        patients: ['patient-1', 'patient-2'],
        currentPosition: 1,
        estimatedWaitTime: 30,
        createdAt: new Date(),
      },
    ];
  }

  async getQueue(id: string) {
    const queues = await this.getQueues();
    const queue = queues.find(q => q.id === id);
    
    if (!queue) {
      throw new NotFoundException('Queue not found');
    }
    
    return queue;
  }

  async addPatientToQueue(queueId: string, patientId: string) {
    const queue = await this.getQueue(queueId);
    
    if (queue.patients.includes(patientId)) {
      throw new BadRequestException('Patient already in queue');
    }

    return {
      ...queue,
      patients: [...queue.patients, patientId],
      position: queue.patients.length + 1,
      estimatedWaitTime: (queue.patients.length + 1) * 15, // 15 minutes per patient
    };
  }

  async removePatientFromQueue(queueId: string, patientId: string) {
    const queue = await this.getQueue(queueId);
    
    if (!queue.patients.includes(patientId)) {
      throw new BadRequestException('Patient not in queue');
    }

    return {
      ...queue,
      patients: queue.patients.filter(p => p !== patientId),
    };
  }

  async getPatientPosition(queueId: string, patientId: string) {
    const queue = await this.getQueue(queueId);
    const position = queue.patients.indexOf(patientId) + 1;
    
    if (position === 0) {
      throw new NotFoundException('Patient not found in queue');
    }

    return {
      queueId,
      patientId,
      position,
      estimatedWaitTime: position * 15,
      patientsAhead: position - 1,
    };
  }

  async getQueueStatus(queueId: string) {
    const queue = await this.getQueue(queueId);
    
    return {
      id: queue.id,
      name: queue.name,
      totalPatients: queue.patients.length,
      currentPosition: queue.currentPosition,
      averageWaitTime: 15,
      estimatedWaitTime: queue.patients.length * 15,
    };
  }
}
