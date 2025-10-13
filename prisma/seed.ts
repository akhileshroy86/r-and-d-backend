import { PrismaClient } from '@prisma/client';
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
      role: 'ADMIN',
    },
  });

  // Create sample doctor user
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr.smith@healthcare.com' },
    update: {},
    create: {
      email: 'dr.smith@healthcare.com',
      password: doctorPassword,
      role: 'DOCTOR',
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
      role: 'PATIENT',
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
    include: {
      patient: true,
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
      role: 'STAFF',
      staff: {
        create: {
          fullName: 'Alice Johnson',
          email: 'staff@healthcare.com',
          phone: '+1122334455',
          password: 'staff123',
          position: 'Reception Staff',
        },
      },
    },
  });

  // Create sample hospital
  const hospital = await prisma.hospital.upsert({
    where: { id: 'apollo-hyderabad' },
    update: {},
    create: {
      id: 'apollo-hyderabad',
      name: 'Apollo Hospitals Hyderabad',
      address: 'Jubilee Hills, Hyderabad',
      phone: '+91-40-23607777',
      email: 'info@apollohyderabad.com',
      rating: 4.5,
      latitude: 17.4239,
      longitude: 78.4738,
    },
  });

  // Create department
  const department = await prisma.department.upsert({
    where: { id: 'cardiology-dept' },
    update: {},
    create: {
      id: 'cardiology-dept',
      name: 'Cardiology',
      hospitalId: hospital.id,
      description: 'Heart and cardiovascular diseases',
    },
  });

  // Create doctor
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      firstName: 'John',
      lastName: 'Smith',
      name: 'Dr. John Smith',
      specialization: 'Cardiology',
      qualification: 'MD Cardiology',
      department: 'Cardiology',
      departmentId: department.id,
      hospitalId: hospital.id,
      experience: 10,
      consultationFee: 500,
      rating: 4.5,
    },
  });

  // Create sample appointment and booking
  const appointment = await prisma.appointment.upsert({
    where: { id: 'sample-appointment-1' },
    update: {},
    create: {
      id: 'sample-appointment-1',
      patientId: patientUser.patient.id,
      doctorId: doctor.id,
      dateTime: new Date(),
      timeRange: '10:00-11:00',
      status: 'CONFIRMED',
    },
  });

  const booking = await prisma.booking.upsert({
    where: { appointmentId: appointment.id },
    update: {},
    create: {
      appointmentId: appointment.id,
      timeRange: '10:00-11:00',
      status: 'CONFIRMED',
    },
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: {},
    create: {
      bookingId: booking.id,
      amount: 500,
      currency: 'INR',
      status: 'COMPLETED',
      method: 'ONLINE',
      paidAt: new Date(),
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });