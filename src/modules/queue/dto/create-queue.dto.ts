import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateQueueDto {
  @IsString()
  name: string;

  @IsString()
  doctorId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxSize?: number;
}