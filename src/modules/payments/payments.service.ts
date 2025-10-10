import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
const Razorpay = require('razorpay');
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createPaymentOrder(createPaymentDto: CreatePaymentDto) {
    const { amount, currency = 'INR', bookingId } = createPaymentDto;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `booking_${bookingId}`,
    };

    const order = await this.razorpay.orders.create(options);

    // Store payment record
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency,
        razorpayOrderId: order.id,
        status: 'PENDING',
        method: 'ONLINE',
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id,
    };
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verifyPaymentDto;

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Update payment status
    const payment = await this.prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    return { success: true, payment };
  }

  async getPaymentByBooking(bookingId: string) {
    return this.prisma.payment.findFirst({
      where: { bookingId },
    });
  }

  async getPaymentAnalytics() {
    const [totalRevenue, todayRevenue, onlinePayments, offlinePayments] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          paidAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({
        where: { method: 'ONLINE', status: 'COMPLETED' },
      }),
      this.prisma.payment.count({
        where: { method: 'OFFLINE', status: 'COMPLETED' },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      todayRevenue: todayRevenue._sum.amount || 0,
      onlinePayments,
      offlinePayments,
    };
  }
}
