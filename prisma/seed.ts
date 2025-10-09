import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@healthcare.com' },
    update: {},
    create: {
      email: 'admin@healthcare.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create sample doctor
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr.smith@healthcare.com' },
    update: {},
    create: {
      email: 'dr.smith@healthcare.com',
      password: doctorPassword,
      role: UserRole.DOCTOR,
      doctor: {
        create: {
          firstName: 'John',
          lastName: 'Smith',
          specialization: 'Cardiology',
          qualification: 'MD',
          licenseNumber: 'MD123456',
          phone: '+1234567890',
        },
      },
    },
  });

  // Create sample patient
  const patientPassword = await bcrypt.hash('patient123', 10);
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      password: patientPassword,
      role: UserRole.PATIENT,
      patient: {
        create: {
          firstName: 'Jane',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          phone: '+1987654321',
          address: '123 Main St, City, State',
        },
      },
    },
  });

  // Create sample staff
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@healthcare.com' },
    update: {},
    create: {
      email: 'staff@healthcare.com',
      password: staffPassword,
      role: UserRole.STAFF,
      staff: {
        create: {
          firstName: 'Alice',
          lastName: 'Johnson',
          position: 'Nurse',
          phone: '+1122334455',
        },
      },
    },
  });

  console.log('Seed data created successfully');
  console.log('Admin:', admin);
  console.log('Doctor User:', doctorUser);
  console.log('Patient User:', patientUser);
  console.log('Staff User:', staffUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });