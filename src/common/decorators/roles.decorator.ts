import { SetMetadata } from '@nestjs/common';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
