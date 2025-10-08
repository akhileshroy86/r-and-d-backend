import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { JoinQueueDto } from './dto/join-queue.dto';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';

@Injectable()
export class RealtimeQueueService {
  constructor(private prisma: PrismaService) {}

  async joinQueue(joinQueueDto: JoinQueueDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's queue for the doctor
    let queue = await this.prisma.queue.findUnique({
      where: {
        doctorId_date: {
          doctorId: joinQueueDto.doctorId,
          date: today,
        },
      },
      include: { entries: true },
    });

    if (!queue) {
      queue = await this.prisma.queue.create({
        data: {
          doctorId: joinQueueDto.doctorId,
          date: today,
        },
        include: { entries: true },
      });
    }

    // Check if patient already in queue
    const existingEntry = await this.prisma.queueEntry.findFirst({
      where: {
        queueId: queue.id,
        patientId: joinQueueDto.patientId,
        status: { in: [QueueStatus.WAITING, QueueStatus.CALLED] },
      },
    });

    if (existingEntry) {
      return existingEntry;
    }

    // Add patient to queue
    const position = queue.entries.length + 1;
    const queueEntry = await this.prisma.queueEntry.create({
      data: {
        queueId: queue.id,
        patientId: joinQueueDto.patientId,
        position,
      },
      include: {
        patient: {
          select: { firstName: true, lastName: true, phone: true },
        },
      },
    });

    await this.updateEstimatedWaitTime(queue.id);
    return queueEntry;
  }

  async getQueueStatus(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queue = await this.prisma.queue.findUnique({
      where: {
        doctorId_date: {
          doctorId,
          date: today,
        },
      },
      include: {
        entries: {
          where: {
            status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_CONSULTATION] },
          },
          include: {
            patient: {
              select: { firstName: true, lastName: true, phone: true },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    return queue || { entries: [], currentPosition: 0, estimatedWaitTime: 0 };
  }

  async callNextPatient(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queue = await this.prisma.queue.findUnique({
      where: {
        doctorId_date: {
          doctorId,
          date: today,
        },
      },
    });

    if (!queue) return null;

    const nextEntry = await this.prisma.queueEntry.findFirst({
      where: {
        queueId: queue.id,
        status: QueueStatus.WAITING,
      },
      orderBy: { position: 'asc' },
      include: {
        patient: {
          select: { firstName: true, lastName: true, phone: true },
        },
      },
    });

    if (!nextEntry) return null;

    // Update entry status and queue position
    const updatedEntry = await this.prisma.queueEntry.update({
      where: { id: nextEntry.id },
      data: {
        status: QueueStatus.CALLED,
        calledAt: new Date(),
      },
      include: {
        patient: {
          select: { firstName: true, lastName: true, phone: true },
        },
      },
    });

    await this.prisma.queue.update({
      where: { id: queue.id },
      data: { currentPosition: nextEntry.position },
    });

    await this.updateEstimatedWaitTime(queue.id);
    return updatedEntry;
  }

  async markPatientInConsultation(queueEntryId: string) {
    return this.prisma.queueEntry.update({
      where: { id: queueEntryId },
      data: { status: QueueStatus.IN_CONSULTATION },
    });
  }

  async completeConsultation(queueEntryId: string) {
    return this.prisma.queueEntry.update({
      where: { id: queueEntryId },
      data: { status: QueueStatus.COMPLETED },
    });
  }

  private async updateEstimatedWaitTime(queueId: string) {
    const waitingCount = await this.prisma.queueEntry.count({
      where: {
        queueId,
        status: QueueStatus.WAITING,
      },
    });

    // Estimate 15 minutes per patient
    const estimatedWaitTime = waitingCount * 15;

    await this.prisma.queue.update({
      where: { id: queueId },
      data: { estimatedWaitTime },
    });
  }
}
