import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { HospitalStatus } from '../../../common/constants/enums';

export class CreateHospitalDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsEnum(HospitalStatus)
  status?: HospitalStatus;

  @IsOptional()
  operatingHours?: any;
}
