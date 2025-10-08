import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}