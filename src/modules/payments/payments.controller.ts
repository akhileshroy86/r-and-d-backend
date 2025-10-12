import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('razorpay/create')
  async createPaymentOrder(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.createPaymentOrder(createPaymentDto);
  }

  @Post('razorpay/verify')
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyPaymentDto);
  }

  @Get('booking/:bookingId')
  async getPaymentByBooking(@Param('bookingId') bookingId: string) {
    return this.paymentsService.getPaymentByBooking(bookingId);
  }

  @Get()
  async getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  @Get('analytics')
  async getPaymentAnalytics() {
    return this.paymentsService.getPaymentAnalytics();
  }
}
