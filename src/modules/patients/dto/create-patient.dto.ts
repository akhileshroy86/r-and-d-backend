import { IsString, IsEmail, MinLength, IsDateString, IsOptional } from 'class-validator';

export class CreatePatientDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;
}
