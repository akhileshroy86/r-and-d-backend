import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto) {
    const review = await this.prisma.review.create({
      data: createReviewDto,
      include: {
        patient: {
          select: { firstName: true, lastName: true },
        },
        doctor: {
          select: { firstName: true, lastName: true },
        },
        hospital: {
          select: { name: true },
        },
      },
    });

    // Update doctor rating if doctorId provided
    if (createReviewDto.doctorId) {
      await this.updateDoctorRating(createReviewDto.doctorId);
    }

    // Update hospital rating if hospitalId provided
    if (createReviewDto.hospitalId) {
      await this.updateHospitalRating(createReviewDto.hospitalId);
    }

    return review;
  }

  async findByDoctor(doctorId: string) {
    return this.prisma.review.findMany({
      where: { doctorId },
      include: {
        patient: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByHospital(hospitalId: string) {
    return this.prisma.review.findMany({
      where: { hospitalId },
      include: {
        patient: {
          select: { firstName: true, lastName: true },
        },
        doctor: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.review.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: { firstName: true, lastName: true },
        },
        hospital: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async updateDoctorRating(doctorId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { doctorId },
    });

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await this.prisma.doctor.update({
        where: { id: doctorId },
        data: {
          rating: avgRating,
          totalReviews: reviews.length,
        },
      });
    }
  }

  private async updateHospitalRating(hospitalId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { hospitalId },
    });

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await this.prisma.hospital.update({
        where: { id: hospitalId },
        data: {
          rating: avgRating,
          totalReviews: reviews.length,
        },
      });
    }
  }
}