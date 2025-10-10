import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
