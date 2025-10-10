import { Module } from '@nestjs/common';
import { SymptomsController } from './symptoms.controller';
import { SymptomsService } from './symptoms.service';
import { PrismaModule } from '../../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SymptomsController],
  providers: [SymptomsService],
})
export class SymptomsModule {}