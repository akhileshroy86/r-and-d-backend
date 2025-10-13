import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class DoctorScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { doctorId, ...scheduleData } = createScheduleDto;
    return this.prisma.doctorSchedule.create({
      data: {
        ...scheduleData,
        availableDays: scheduleData.availableDays ? scheduleData.availableDays.join(',') : '',
        doctor: {
          connect: { id: doctorId }
        }
      },
      include: {
        doctor: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async findByDoctor(doctorId: string) {
    return this.prisma.doctorSchedule.findUnique({
      where: { doctorId },
      include: {
        doctor: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  async update(doctorId: string, updateData: Partial<CreateScheduleDto>) {
    const { doctorId: _, ...scheduleData } = updateData;
    return this.prisma.doctorSchedule.update({
      where: { doctorId },
      data: {
        ...scheduleData,
        availableDays: scheduleData.availableDays ? scheduleData.availableDays.join(',') : undefined,
      },
    });
  }

  async getAvailableSlots(doctorId: string, date: Date) {
    const schedule = await this.findByDoctor(doctorId);
    if (!schedule) return [];

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    if (!schedule.availableDays.split(',').includes(dayName)) return [];

    // Get existing appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await this.prisma.appointment.count({
      where: {
        doctorId,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'CANCELLED' },
      },
    });

    // Check if doctor has reached max patients for the day
    if (existingAppointments >= schedule.maxPatientsPerDay) {
      return [];
    }

    // Generate time slots
    const slots = this.generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.lunchBreakStart,
      schedule.lunchBreakEnd,
      schedule.consultationDuration,
    );

    return slots.map(slot => ({
      startTime: slot.start,
      endTime: slot.end,
      available: true, // Can be enhanced to check actual bookings
    }));
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    lunchStart?: string,
    lunchEnd?: string,
    duration: number = 30,
  ) {
    const slots = [];
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const lunchStartMin = lunchStart ? this.timeToMinutes(lunchStart) : null;
    const lunchEndMin = lunchEnd ? this.timeToMinutes(lunchEnd) : null;

    for (let current = start; current < end; current += duration) {
      // Skip lunch break
      if (lunchStartMin && lunchEndMin && 
          current >= lunchStartMin && current < lunchEndMin) {
        continue;
      }

      const slotEnd = current + duration;
      if (slotEnd <= end) {
        slots.push({
          start: this.minutesToTime(current),
          end: this.minutesToTime(slotEnd),
        });
      }
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  async isDoctorAvailable(doctorId: string, dateTime: Date): Promise<boolean> {
    const schedule = await this.findByDoctor(doctorId);
    if (!schedule) return false;

    const dayName = dateTime.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    if (!schedule.availableDays.split(',').includes(dayName)) return false;

    const timeString = dateTime.toTimeString().slice(0, 5);
    const timeMinutes = this.timeToMinutes(timeString);
    const startMinutes = this.timeToMinutes(schedule.startTime);
    const endMinutes = this.timeToMinutes(schedule.endTime);

    // Check if time is within working hours
    if (timeMinutes < startMinutes || timeMinutes >= endMinutes) return false;

    // Check lunch break
    if (schedule.lunchBreakStart && schedule.lunchBreakEnd) {
      const lunchStartMin = this.timeToMinutes(schedule.lunchBreakStart);
      const lunchEndMin = this.timeToMinutes(schedule.lunchBreakEnd);
      if (timeMinutes >= lunchStartMin && timeMinutes < lunchEndMin) return false;
    }

    return true;
  }
}
