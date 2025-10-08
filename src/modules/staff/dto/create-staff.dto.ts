import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  position: string;
}
