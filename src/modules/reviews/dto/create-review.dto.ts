import { IsString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  patientId: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  hospitalId?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
