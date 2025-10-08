import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeQueueService } from './realtime-queue.service';
import { JoinQueueDto } from './dto/join-queue.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeQueueGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly queueService: RealtimeQueueService) {}

  @SubscribeMessage('joinQueue')
  async handleJoinQueue(
    @MessageBody() joinQueueDto: JoinQueueDto,
    @ConnectedSocket() client: Socket,
  ) {
    const queueEntry = await this.queueService.joinQueue(joinQueueDto);
    
    // Join doctor-specific room
    client.join(`doctor-${joinQueueDto.doctorId}`);
    
    // Emit updated queue to all clients in the room
    this.server.to(`doctor-${joinQueueDto.doctorId}`).emit('queueUpdated', {
      queue: await this.queueService.getQueueStatus(joinQueueDto.doctorId),
    });

    return queueEntry;
  }

  @SubscribeMessage('getQueueStatus')
  async handleGetQueueStatus(
    @MessageBody() data: { doctorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`doctor-${data.doctorId}`);
    return this.queueService.getQueueStatus(data.doctorId);
  }

  @SubscribeMessage('callNextPatient')
  async handleCallNextPatient(
    @MessageBody() data: { doctorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const result = await this.queueService.callNextPatient(data.doctorId);
    
    // Emit updated queue to all clients
    this.server.to(`doctor-${data.doctorId}`).emit('queueUpdated', {
      queue: await this.queueService.getQueueStatus(data.doctorId),
    });

    // Emit patient called notification
    if (result) {
      this.server.to(`doctor-${data.doctorId}`).emit('patientCalled', result);
    }

    return result;
  }

  async emitQueueUpdate(doctorId: string) {
    const queue = await this.queueService.getQueueStatus(doctorId);
    this.server.to(`doctor-${doctorId}`).emit('queueUpdated', { queue });
  }
}
