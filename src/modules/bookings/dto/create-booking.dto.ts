import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  appointmentId: string;

  @IsString()
  timeRange: string; // "12:00-13:00"

  @IsOptional()
  @IsBoolean()
  canRejoin?: boolean = false;
}
