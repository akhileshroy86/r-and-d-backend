import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '../../../common/constants/enums';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}
