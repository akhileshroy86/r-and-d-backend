import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';

@Injectable()
export class HospitalsService {
  constructor(private prisma: PrismaService) {}

  async create(createHospitalDto: CreateHospitalDto) {
    return this.prisma.hospital.create({
      data: createHospitalDto,
    });
  }

  async findAll() {
    return this.prisma.hospital.findMany({
      include: {
        departments: true,
        _count: {
          select: {
            doctors: true,
            reviews: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.hospital.findUnique({
      where: { id },
      include: {
        departments: true,
        doctors: true,
        reviews: {
          include: {
            patient: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async findNearby(latitude: number, longitude: number, radius: number = 10) {
    return this.prisma.hospital.findMany({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
        ],
      },
      include: {
        departments: true,
        _count: {
          select: { doctors: true },
        },
      },
    });
  }

  async updateRating(hospitalId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { hospitalId },
    });

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      return this.prisma.hospital.update({
        where: { id: hospitalId },
        data: {
          rating: avgRating,
          totalReviews: reviews.length,
        },
      });
    }
  }
}