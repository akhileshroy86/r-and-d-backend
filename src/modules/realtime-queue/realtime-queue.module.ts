import { Module } from '@nestjs/common';
import { RealtimeQueueService } from './realtime-queue.service';
import { RealtimeQueueController } from './realtime-queue.controller';
import { RealtimeQueueGateway } from './realtime-queue.gateway';
import { PrismaModule } from '../../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RealtimeQueueController],
  providers: [RealtimeQueueService, RealtimeQueueGateway],
  exports: [RealtimeQueueService, RealtimeQueueGateway],
})
export class RealtimeQueueModule {}