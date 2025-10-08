import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { StaffModule } from './modules/staff/staff.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { SettingsModule } from './modules/settings/settings.module';
import { QueueModule } from './modules/queue/queue.module';
import { PaymentsModule } from './modules/payments/payments.module';
// New modules
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RealtimeQueueModule } from './modules/realtime-queue/realtime-queue.module';
import { SearchModule } from './modules/search/search.module';
import { DoctorScheduleModule } from './modules/doctor-schedule/doctor-schedule.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { SymptomsModule } from './modules/symptoms/symptoms.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HospitalsModule,
    DepartmentsModule,
    DoctorsModule,
    PatientsModule,
    DoctorScheduleModule,
    AppointmentsModule,
    BookingsModule,
    AdminAuthModule,
    SymptomsModule,
    StaffModule,
    PaymentsModule,
    ReviewsModule,
    RealtimeQueueModule,
    SearchModule,
    AnalyticsModule,
    NotificationsModule,
    HealthModule,
    FileUploadModule,
    AuditLogModule,
    SettingsModule,
    QueueModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
