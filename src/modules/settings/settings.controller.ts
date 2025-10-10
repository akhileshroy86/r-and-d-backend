import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }

  @Get('preferences')
  getUserPreferences(@Request() req) {
    return this.settingsService.getUserPreferences(req.user.id);
  }

  @Put('preferences')
  updateUserPreferences(@Request() req, @Body() preferences: any) {
    return this.settingsService.updateUserPreferences(req.user.id, preferences);
  }
}
