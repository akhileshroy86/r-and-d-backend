import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    // Mock settings - in real implementation, you'd have a Settings model
    return {
      clinicName: 'Healthcare Clinic',
      clinicAddress: '123 Medical Street, Health City',
      clinicPhone: '+1-555-0123',
      clinicEmail: 'info@healthcareclinic.com',
      businessHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '14:00' },
        sunday: { open: null, close: null },
      },
      emailNotifications: true,
      smsNotifications: false,
    };
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    // Mock update - in real implementation, you'd update the Settings model
    const currentSettings = await this.getSettings();
    
    return {
      ...currentSettings,
      ...updateSettingsDto,
      updatedAt: new Date(),
    };
  }

  async getUserPreferences(userId: string) {
    // Mock user preferences
    return {
      userId,
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      smsNotifications: false,
    };
  }

  async updateUserPreferences(userId: string, preferences: any) {
    const currentPreferences = await this.getUserPreferences(userId);
    
    return {
      ...currentPreferences,
      ...preferences,
      updatedAt: new Date(),
    };
  }
}
