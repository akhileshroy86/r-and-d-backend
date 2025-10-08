import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeSymptomsDto {
  @IsString()
  @IsNotEmpty()
  symptoms: string;
}