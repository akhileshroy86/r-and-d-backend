import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../src/common/constants/enums';

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

  // Create sample doctors
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr.smith@healthcare.com' },
    update: {},
    create: {
      email: 'dr.smith@healthcare.com',
      password: doctorPassword,
      role: UserRole.DOCTOR,
    },
  });

  const neurologyDoctorUser = await prisma.user.upsert({
    where: { email: 'dr.neuro@healthcare.com' },
    update: {},
    create: {
      email: 'dr.neuro@healthcare.com',
      password: doctorPassword,
      role: UserRole.DOCTOR,
    },
  });

  const orthoDoctorUser = await prisma.user.upsert({
    where: { email: 'dr.ortho@healthcare.com' },
    update: {},
    create: {
      email: 'dr.ortho@healthcare.com',
      password: doctorPassword,
      role: UserRole.DOCTOR,
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
          fullName: 'Alice Johnson',
          email: 'staff@healthcare.com',
          phone: '+1122334455',
          password: 'staff123',
          position: 'Reception Staff',
          isActive: true,
        },
      },
    },
  });

  // Create sample hospitals in Hyderabad
  const hospitals = await Promise.all([
    prisma.hospital.upsert({
      where: { id: 'apollo-hyderabad' },
      update: {},
      create: {
        id: 'apollo-hyderabad',
        name: 'Apollo Hospitals Hyderabad',
        address: 'Jubilee Hills, Hyderabad',
        city: 'Hyderabad',
        phone: '+91-40-23607777',
        email: 'info@apollohyderabad.com',
        rating: 4.5,
        specialties: ['Cardiology', 'Neurology', 'Oncology'],
        latitude: 17.4239,
        longitude: 78.4738,
      },
    }),
    prisma.hospital.upsert({
      where: { id: 'care-hyderabad' },
      update: {},
      create: {
        id: 'care-hyderabad',
        name: 'CARE Hospitals Hyderabad',
        address: 'Banjara Hills, Hyderabad',
        city: 'Hyderabad',
        phone: '+91-40-61651000',
        email: 'info@carehospitals.com',
        rating: 4.2,
        specialties: ['Orthopedics', 'Gastroenterology', 'Pediatrics'],
        latitude: 17.4126,
        longitude: 78.4482,
      },
    }),
    prisma.hospital.upsert({
      where: { id: 'yashoda-hyderabad' },
      update: {},
      create: {
        id: 'yashoda-hyderabad',
        name: 'Yashoda Hospitals Hyderabad',
        address: 'Somajiguda, Hyderabad',
        city: 'Hyderabad',
        phone: '+91-40-23554455',
        email: 'info@yashodahospitals.com',
        rating: 4.3,
        specialties: ['Emergency Medicine', 'Dermatology', 'ENT'],
        latitude: 17.4291,
        longitude: 78.4744,
      },
    }),
  ]);

  // Create departments for hospitals
  const departments = [];
  for (const hospital of hospitals) {
    const hospitalDepts = await Promise.all([
      prisma.department.upsert({
        where: { id: `${hospital.id}-cardiology` },
        update: {},
        create: {
          id: `${hospital.id}-cardiology`,
          name: 'Cardiology',
          hospitalId: hospital.id,
          description: 'Heart and cardiovascular diseases',
        },
      }),
      prisma.department.upsert({
        where: { id: `${hospital.id}-neurology` },
        update: {},
        create: {
          id: `${hospital.id}-neurology`,
          name: 'Neurology',
          hospitalId: hospital.id,
          description: 'Brain and nervous system disorders',
        },
      }),
      prisma.department.upsert({
        where: { id: `${hospital.id}-orthopedics` },
        update: {},
        create: {
          id: `${hospital.id}-orthopedics`,
          name: 'Orthopedics',
          hospitalId: hospital.id,
          description: 'Bone and joint problems',
        },
      }),
    ]);
    departments.push(...hospitalDepts);
  }

  // Create symptoms
  const symptoms = await Promise.all([
    prisma.symptom.upsert({
      where: { id: 'headache' },
      update: {},
      create: {
        id: 'headache',
        name: 'Headache',
        departmentId: departments.find(d => d.name === 'Neurology')?.id || departments[0].id,
        keywords: ['headache', 'migraine', 'head pain'],
      },
    }),
    prisma.symptom.upsert({
      where: { id: 'chest-pain' },
      update: {},
      create: {
        id: 'chest-pain',
        name: 'Chest Pain',
        departmentId: departments.find(d => d.name === 'Cardiology')?.id || departments[0].id,
        keywords: ['chest pain', 'heart pain', 'cardiac pain'],
      },
    }),
    prisma.symptom.upsert({
      where: { id: 'joint-pain' },
      update: {},
      create: {
        id: 'joint-pain',
        name: 'Joint Pain',
        departmentId: departments.find(d => d.name === 'Orthopedics')?.id || departments[0].id,
        keywords: ['joint pain', 'knee pain', 'back pain'],
      },
    }),
  ]);

  // Create doctors with department references
  const cardiologyDept = departments.find(d => d.name === 'Cardiology');
  const neurologyDept = departments.find(d => d.name === 'Neurology');
  const orthoDept = departments.find(d => d.name === 'Orthopedics');

  await prisma.doctor.upsert({
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
      departmentId: cardiologyDept?.id,
      hospitalId: cardiologyDept?.hospitalId,
      experience: 10,
      consultationFee: 500,
      rating: 4.5,
    },
  });

  await prisma.doctor.upsert({
    where: { userId: neurologyDoctorUser.id },
    update: {},
    create: {
      userId: neurologyDoctorUser.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      name: 'Dr. Sarah Johnson',
      specialization: 'Neurology',
      qualification: 'MD Neurology',
      department: 'Neurology',
      departmentId: neurologyDept?.id,
      hospitalId: neurologyDept?.hospitalId,
      experience: 8,
      consultationFee: 600,
      rating: 4.3,
    },
  });

  await prisma.doctor.upsert({
    where: { userId: orthoDoctorUser.id },
    update: {},
    create: {
      userId: orthoDoctorUser.id,
      firstName: 'Michael',
      lastName: 'Brown',
      name: 'Dr. Michael Brown',
      specialization: 'Orthopedics',
      qualification: 'MS Orthopedics',
      department: 'Orthopedics',
      departmentId: orthoDept?.id,
      hospitalId: orthoDept?.hospitalId,
      experience: 12,
      consultationFee: 700,
      rating: 4.6,
    },
  });

  console.log('Seed data created successfully');
  console.log('Admin:', admin);
  console.log('Hospitals:', hospitals.length);
  console.log('Departments:', departments.length);
  console.log('Symptoms:', symptoms.length);
  console.log('Doctors created with department references');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });