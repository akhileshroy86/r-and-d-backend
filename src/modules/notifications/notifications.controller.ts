import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('appointment/:id/confirmation')
  sendAppointmentConfirmation(@Param('id') id: string) {
    return this.notificationsService.sendAppointmentConfirmation(id);
  }

  @Post('appointment/:id/reminder')
  sendAppointmentReminder(@Param('id') id: string) {
    return this.notificationsService.sendAppointmentReminder(id);
  }
}