import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RealtimeQueueService } from './realtime-queue.service';
import { JoinQueueDto } from './dto/join-queue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('realtime-queue')
@UseGuards(JwtAuthGuard)
export class RealtimeQueueController {
  constructor(private readonly queueService: RealtimeQueueService) {}

  @Post('join')
  joinQueue(@Body() joinQueueDto: JoinQueueDto) {
    return this.queueService.joinQueue(joinQueueDto);
  }

  @Get('status/:doctorId')
  getQueueStatus(@Param('doctorId') doctorId: string) {
    return this.queueService.getQueueStatus(doctorId);
  }

  @Post('call-next/:doctorId')
  callNextPatient(@Param('doctorId') doctorId: string) {
    return this.queueService.callNextPatient(doctorId);
  }

  @Post('in-consultation/:queueEntryId')
  markInConsultation(@Param('queueEntryId') queueEntryId: string) {
    return this.queueService.markPatientInConsultation(queueEntryId);
  }

  @Post('complete/:queueEntryId')
  completeConsultation(@Param('queueEntryId') queueEntryId: string) {
    return this.queueService.completeConsultation(queueEntryId);
  }
}
