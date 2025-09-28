import { IsString, IsArray, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  doctorId: string;

  @IsArray()
  @IsString({ each: true })
  availableDays: string[]; // ['MON', 'TUE', 'WED']

  @IsString()
  startTime: string; // '09:00'

  @IsString()
  endTime: string; // '17:00'

  @IsOptional()
  @IsString()
  lunchBreakStart?: string; // '13:00'

  @IsOptional()
  @IsString()
  lunchBreakEnd?: string; // '14:00'

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(120)
  consultationDuration?: number = 30;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxPatientsPerDay?: number = 20;
}