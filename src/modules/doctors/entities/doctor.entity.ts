export class DoctorEntity {
  id: string;
  name: string;
  qualification: string;
  department: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  schedule?: {
    availableDays: string[];
    startTime: string;
    endTime: string;
    lunchBreakStart?: string;
    lunchBreakEnd?: string;
    consultationDuration: number;
    maxPatientsPerDay: number;
  };
}