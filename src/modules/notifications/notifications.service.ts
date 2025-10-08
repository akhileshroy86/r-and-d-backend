import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async sendAppointmentConfirmation(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: true,
      },
    });

    if (!appointment) return;

    // Email notification logic would go here
    console.log(`Appointment confirmation sent to ${appointment.patient.user.email}`);
    
    return {
      message: 'Appointment confirmation sent successfully',
      recipient: appointment.patient.user.email,
    };
  }

  async sendAppointmentReminder(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: true,
      },
    });

    if (!appointment) return;

    // Email notification logic would go here
    console.log(`Appointment reminder sent to ${appointment.patient.user.email}`);
    
    return {
      message: 'Appointment reminder sent successfully',
      recipient: appointment.patient.user.email,
    };
  }
}
