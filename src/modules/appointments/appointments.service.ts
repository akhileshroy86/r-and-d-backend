import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import Razorpay from 'razorpay';
import { PrismaService } from '../../config/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';

@Injectable()
export class AppointmentsService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async create(createAppointmentDto: any) {
    try {
      console.log('=== APPOINTMENT CREATION START ===');
      console.log('Raw input data:', JSON.stringify(createAppointmentDto, null, 2));
      
      // Validate required fields
      if (!createAppointmentDto.patientId) {
        throw new Error('patientId is required');
      }
      if (!createAppointmentDto.doctorId) {
        throw new Error('doctorId is required');
      }
      if (!createAppointmentDto.date) {
        throw new Error('date is required');
      }
      
      const appointmentDate = new Date(createAppointmentDto.date);
      console.log('Parsed appointment date:', appointmentDate);
      
      const duration = createAppointmentDto.duration || 30;
      console.log('Duration:', duration);

      // Check if patient exists - first try by patient ID, then by user ID
      let patient = await this.prisma.patient.findUnique({
        where: { id: createAppointmentDto.patientId }
      });
      
      // If not found by patient ID, try to find by user ID
      if (!patient) {
        patient = await this.prisma.patient.findUnique({
          where: { userId: createAppointmentDto.patientId }
        });
      }
      
      // If still not found, check if it's a user ID or mock ID and create patient record
      if (!patient) {
        // Check if it's a mock patient ID (starts with 'patient_')
        if (createAppointmentDto.patientId.startsWith('patient_')) {
          console.log('Creating patient for mock ID:', createAppointmentDto.patientId);
          
          // Create a temporary user first
          const tempUser = await this.prisma.user.create({
            data: {
              email: `temp_${Date.now()}@example.com`,
              password: 'temp123',
              role: 'PATIENT',
            },
          });
          
          // Create patient record
          patient = await this.prisma.patient.create({
            data: {
              userId: tempUser.id,
              firstName: 'Mock',
              lastName: 'Patient',
              dateOfBirth: new Date('1990-01-01'),
              phone: `+91${Date.now().toString().slice(-10)}`,
              address: 'Mock Address'
            }
          });
          console.log('Mock patient created:', patient.id);
        } else {
          // Check if it's a user ID
          const user = await this.prisma.user.findUnique({
            where: { id: createAppointmentDto.patientId }
          });
          
          if (user && user.role === 'PATIENT') {
            console.log('Creating patient record for existing user:', user.id);
            patient = await this.prisma.patient.create({
              data: {
                userId: user.id,
                firstName: 'Patient',
                lastName: 'User',
                dateOfBirth: new Date('1990-01-01'),
                phone: `+91${Date.now().toString().slice(-10)}`,
                address: 'Not provided'
              }
            });
            console.log('Patient record created:', patient.id);
          } else {
            return {
              success: false,
              error: `Patient with ID ${createAppointmentDto.patientId} not found`
            };
          }
        }
      }
      console.log('Patient found:', patient.firstName, patient.lastName);

      // Check if doctor exists
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: createAppointmentDto.doctorId }
      });
      if (!doctor) {
        throw new Error(`Doctor with ID ${createAppointmentDto.doctorId} not found`);
      }
      console.log('Doctor found:', doctor.firstName, doctor.lastName);

      // Create appointment
      console.log('Creating appointment in database...');
      console.log('Using patient ID:', patient.id);
      console.log('Using doctor ID:', createAppointmentDto.doctorId);
      
      const appointment = await this.prisma.appointment.create({
        data: {
          patientId: patient.id, // Use the actual patient ID, not the input
          doctorId: createAppointmentDto.doctorId,
          dateTime: appointmentDate,
          timeRange: createAppointmentDto.timeRange || 'Not specified',
          duration,
          notes: createAppointmentDto.notes || '',
          status: AppointmentStatus.SCHEDULED,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
              consultationFee: true,
            },
          }
        },
      });

      console.log('=== APPOINTMENT CREATED SUCCESSFULLY ===');
      console.log('Appointment ID:', appointment.id);
      console.log('Patient:', appointment.patient.firstName, appointment.patient.lastName);
      console.log('Doctor:', appointment.doctor.firstName, appointment.doctor.lastName);
      console.log('Date/Time:', appointment.dateTime);
      console.log('Status:', appointment.status);
      
      return {
        success: true,
        id: appointment.id,
        message: 'Appointment created successfully',
        appointment: {
          ...appointment,
          paymentStatus: 'UNPAID'
        }
      };
    } catch (error) {
      console.error('=== APPOINTMENT CREATION ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async findAll(status?: AppointmentStatus, doctorId?: string, patientId?: string) {
    const where: any = {};
    
    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            hospital: {
              select: {
                name: true
              }
            }
          },
        },
        booking: {
          select: {
            bookingId: true,
            payment: {
              select: {
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return appointments.map(appointment => ({
      id: appointment.id,
      bookingId: appointment.booking?.bookingId,
      hospitalName: appointment.doctor.hospital?.name || 'N/A',
      doctorName: appointment.doctor.name,
      timeRange: appointment.timeRange,
      paymentStatus: appointment.booking?.payment?.status || 'PENDING',
      date: appointment.dateTime,
      status: appointment.status
    }));
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            qualification: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async updateStatus(id: string, updateStatusDto: UpdateAppointmentStatusDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });
  }

  async createRazorpayOrder(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        booking: {
          include: { payment: true }
        },
        doctor: { select: { consultationFee: true } }
      }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const order = await this.razorpay.orders.create({
      amount: appointment.doctor.consultationFee * 100, // Amount in paise
      currency: 'INR',
      receipt: `appointment_${appointmentId}`,
    });

    // Update payment with Razorpay order ID
    await this.prisma.payment.update({
      where: { id: appointment.booking.payment.id },
      data: { razorpayOrderId: order.id }
    });

    return order;
  }

  async verifyPayment(appointmentId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        booking: {
          include: { payment: true }
        }
      }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Update payment status to COMPLETED
    await this.prisma.payment.update({
      where: { id: appointment.booking.payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date()
      }
    });

    return { message: 'Payment verified successfully', paymentStatus: 'PAID' };
  }
}
