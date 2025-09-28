import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { SearchQueryDto, SearchType, SortBy } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(searchQuery: SearchQueryDto) {
    const { query, type, department, minFee, maxFee, minRating, sortBy } = searchQuery;

    switch (type) {
      case SearchType.HOSPITALS:
        return this.searchHospitals(searchQuery);
      case SearchType.DOCTORS:
        return this.searchDoctors(searchQuery);
      case SearchType.SYMPTOMS:
        return this.searchSymptoms(searchQuery);
      default:
        return this.searchAll(searchQuery);
    }
  }

  private async searchHospitals(searchQuery: SearchQueryDto) {
    const { query, minRating, sortBy } = searchQuery;
    
    const where: any = {};
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    if (minRating) {
      where.rating = { gte: minRating };
    }

    let orderBy: any = { createdAt: 'desc' };
    
    if (sortBy === SortBy.RATING) {
      orderBy = { rating: 'desc' };
    } else if (sortBy === SortBy.POPULARITY) {
      orderBy = { totalReviews: 'desc' };
    }

    return this.prisma.hospital.findMany({
      where,
      orderBy,
      include: {
        departments: true,
        _count: {
          select: { doctors: true, reviews: true },
        },
      },
    });
  }

  private async searchDoctors(searchQuery: SearchQueryDto) {
    const { query, department, minFee, maxFee, minRating, sortBy } = searchQuery;
    
    const where: any = {};
    
    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { specialization: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    if (department) {
      where.department = {
        name: { contains: department, mode: 'insensitive' },
      };
    }
    
    if (minFee || maxFee) {
      where.consultationFee = {};
      if (minFee) where.consultationFee.gte = minFee;
      if (maxFee) where.consultationFee.lte = maxFee;
    }
    
    if (minRating) {
      where.rating = { gte: minRating };
    }

    let orderBy: any = { createdAt: 'desc' };
    
    if (sortBy === SortBy.RATING) {
      orderBy = { rating: 'desc' };
    } else if (sortBy === SortBy.FEE) {
      orderBy = { consultationFee: 'asc' };
    } else if (sortBy === SortBy.POPULARITY) {
      orderBy = { totalReviews: 'desc' };
    }

    return this.prisma.doctor.findMany({
      where,
      orderBy,
      include: {
        hospital: {
          select: { name: true, address: true },
        },
        department: {
          select: { name: true },
        },
        schedule: true,
      },
    });
  }

  private async searchSymptoms(searchQuery: SearchQueryDto) {
    const { query } = searchQuery;
    
    const where: any = {};
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { keywords: { has: query } },
      ];
    }

    return this.prisma.symptom.findMany({
      where,
      include: {
        department: {
          include: {
            hospital: {
              select: { name: true },
            },
          },
        },
      },
    });
  }

  private async searchAll(searchQuery: SearchQueryDto) {
    const [hospitals, doctors, symptoms] = await Promise.all([
      this.searchHospitals({ ...searchQuery, type: SearchType.HOSPITALS }),
      this.searchDoctors({ ...searchQuery, type: SearchType.DOCTORS }),
      this.searchSymptoms({ ...searchQuery, type: SearchType.SYMPTOMS }),
    ]);

    return {
      hospitals: hospitals.slice(0, 10),
      doctors: doctors.slice(0, 10),
      symptoms: symptoms.slice(0, 10),
    };
  }

  async getPopularSearches() {
    // This would typically come from analytics/search logs
    return [
      'Cardiology',
      'Orthopedics',
      'Pediatrics',
      'Dermatology',
      'Neurology',
    ];
  }

  async getSuggestions(query: string) {
    if (!query || query.length < 2) return [];

    const [hospitals, doctors, departments] = await Promise.all([
      this.prisma.hospital.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        select: { name: true },
        take: 5,
      }),
      this.prisma.doctor.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { specialization: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { firstName: true, lastName: true, specialization: true },
        take: 5,
      }),
      this.prisma.department.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        select: { name: true },
        take: 5,
      }),
    ]);

    return {
      hospitals: hospitals.map(h => h.name),
      doctors: doctors.map(d => `Dr. ${d.firstName} ${d.lastName} - ${d.specialization}`),
      departments: departments.map(d => d.name),
    };
  }
}