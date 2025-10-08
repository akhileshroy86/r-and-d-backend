import { IsString, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  hospitalId: string;

  @IsOptional()
  @IsString()
  description?: string;
}
