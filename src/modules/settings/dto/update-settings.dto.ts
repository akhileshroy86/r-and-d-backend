import { IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  clinicName?: string;

  @IsOptional()
  @IsString()
  clinicAddress?: string;

  @IsOptional()
  @IsString()
  clinicPhone?: string;

  @IsOptional()
  @IsString()
  clinicEmail?: string;

  @IsOptional()
  @IsObject()
  businessHours?: any;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;
}