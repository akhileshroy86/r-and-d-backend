import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateDoctorDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  specialization: string;

  @IsString()
  qualification: string;

  @IsString()
  licenseNumber: string;

  @IsString()
  phone: string;
}