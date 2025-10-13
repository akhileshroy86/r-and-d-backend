import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class MockPrismaService implements OnModuleInit {
  // Mock data storage
  private usersData = new Map();
  private staffData = new Map();
  private doctorsData = new Map();
  private patientsData = new Map();
  private hospitalsData = new Map();
  private departmentsData = new Map();
  private appointmentsData = new Map();
  private bookingsData = new Map();
  private paymentsData = new Map();
  private reviewsData = new Map();
  private queuesData = new Map();
  private queueEntriesData = new Map();
  private symptomsData = new Map();
  private adminData = new Map();
  private userPreferencesData = new Map();
  private doctorScheduleData = new Map();

  async onModuleInit() {
    console.log('Mock Prisma Service initialized');
  }

  private createMockModel(dataMap: Map<any, any>, prefix: string) {
    return {
      create: async (data: any) => {
        const id = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const record = { id, ...data.data };
        dataMap.set(id, record);
        return record;
      },
      findMany: async (query?: any) => {
        return Array.from(dataMap.values());
      },
      findUnique: async (query: any) => {
        for (const [id, record] of dataMap) {
          if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
              if (record[key] === value) {
                return record;
              }
            }
          }
        }
        return null;
      },
      findFirst: async (query?: any) => {
        for (const [id, record] of dataMap) {
          if (!query?.where) return record;
          for (const [key, value] of Object.entries(query.where)) {
            if (record[key] === value) {
              return record;
            }
          }
        }
        return null;
      },
      update: async (query: any) => {
        for (const [id, record] of dataMap) {
          if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
              if (record[key] === value) {
                const updated = { ...record, ...query.data };
                dataMap.set(id, updated);
                return updated;
              }
            }
          }
        }
        return null;
      },
      delete: async (query: any) => {
        for (const [id, record] of dataMap) {
          if (query.where) {
            for (const [key, value] of Object.entries(query.where)) {
              if (record[key] === value) {
                dataMap.delete(id);
                return record;
              }
            }
          }
        }
        return null;
      },
      count: async () => dataMap.size,
      aggregate: async () => ({ _count: { _all: dataMap.size } })
    };
  }

  // All Prisma models
  user = this.createMockModel(this.usersData, 'user');
  staff = this.createMockModel(this.staffData, 'staff');
  doctor = this.createMockModel(this.doctorsData, 'doctor');
  patient = this.createMockModel(this.patientsData, 'patient');
  hospital = this.createMockModel(this.hospitalsData, 'hospital');
  department = this.createMockModel(this.departmentsData, 'department');
  appointment = this.createMockModel(this.appointmentsData, 'appointment');
  booking = this.createMockModel(this.bookingsData, 'booking');
  payment = this.createMockModel(this.paymentsData, 'payment');
  review = this.createMockModel(this.reviewsData, 'review');
  queue = this.createMockModel(this.queuesData, 'queue');
  queueEntry = this.createMockModel(this.queueEntriesData, 'queueEntry');
  symptom = this.createMockModel(this.symptomsData, 'symptom');
  admin = this.createMockModel(this.adminData, 'admin');
  userPreferences = this.createMockModel(this.userPreferencesData, 'userPreferences');
  doctorSchedule = this.createMockModel(this.doctorScheduleData, 'doctorSchedule');

  async $disconnect() {
    console.log('Mock Prisma Service disconnected');
  }

  async $connect() {
    console.log('Mock Prisma Service connected');
  }

  $transaction = async (fn: any) => {
    return fn(this);
  };
}