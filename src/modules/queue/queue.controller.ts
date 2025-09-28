import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('queue')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  createQueue(@Body() createQueueDto: CreateQueueDto) {
    return this.queueService.createQueue(createQueueDto);
  }

  @Get()
  getQueues() {
    return this.queueService.getQueues();
  }

  @Get(':id')
  getQueue(@Param('id') id: string) {
    return this.queueService.getQueue(id);
  }

  @Post(':id/patients/:patientId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.PATIENT)
  addPatientToQueue(@Param('id') queueId: string, @Param('patientId') patientId: string) {
    return this.queueService.addPatientToQueue(queueId, patientId);
  }

  @Delete(':id/patients/:patientId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.PATIENT)
  removePatientFromQueue(@Param('id') queueId: string, @Param('patientId') patientId: string) {
    return this.queueService.removePatientFromQueue(queueId, patientId);
  }

  @Get(':id/patients/:patientId/position')
  getPatientPosition(@Param('id') queueId: string, @Param('patientId') patientId: string) {
    return this.queueService.getPatientPosition(queueId, patientId);
  }

  @Get(':id/status')
  getQueueStatus(@Param('id') queueId: string) {
    return this.queueService.getQueueStatus(queueId);
  }
}