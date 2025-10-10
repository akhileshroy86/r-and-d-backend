import { IsString, IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  patientId: string;

  @IsString()
  doctorId: string;

  @IsDateString()
  date: string;

  @IsString()
  timeRange: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  duration?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
