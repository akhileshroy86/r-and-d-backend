import { IsString } from 'class-validator';

export class JoinQueueDto {
  @IsString()
  doctorId: string;

  @IsString()
  patientId: string;
}