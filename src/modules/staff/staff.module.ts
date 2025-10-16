import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { StaffSettingsController } from './staff-settings.controller';
import { PrismaModule } from '../../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StaffController, StaffSettingsController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
