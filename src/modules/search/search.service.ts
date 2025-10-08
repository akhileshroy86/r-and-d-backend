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
        { name: { contains: query } },
        { address: { contains: query } },
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
      // First check if query matches any symptoms
      const symptomBasedSearch = await this.searchBySymptoms(query);
      
      if (symptomBasedSearch.length > 0) {
        // If symptoms found, search doctors in those departments
        const departmentIds = symptomBasedSearch.map(s => s.departmentId);
        where.OR = [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { specialization: { contains: query, mode: 'insensitive' } },
          { departmentId: { in: departmentIds } },
        ];
      } else {
        // Regular doctor search
        where.OR = [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { specialization: { contains: query, mode: 'insensitive' } },
        ];
      }
    }
    
    if (department) {
      where.departmentRef = {
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
        departmentRef: {
          select: { name: true },
        },
        schedule: true,
      },
    });
  }

  private async searchBySymptoms(query: string) {
    return this.prisma.symptom.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { keywords: { hasSome: [query.toLowerCase()] } },
        ],
      },
    });
  }

  private async searchSymptoms(searchQuery: SearchQueryDto) {
    const { query } = searchQuery;
    
    if (!query) {
      return [];
    }

    // Find symptoms that match the query
    const matchingSymptoms = await this.prisma.symptom.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { keywords: { hasSome: [query.toLowerCase()] } },
        ],
      },
      include: {
        department: {
          include: {
            doctors: {
              include: {
                hospital: {
                  select: { name: true, address: true },
                },
                schedule: true,
              },
            },
          },
        },
      },
    });

    // Extract doctors from matching departments
    const doctors = [];
    const seenDoctorIds = new Set();

    for (const symptom of matchingSymptoms) {
      for (const doctor of symptom.department.doctors) {
        if (!seenDoctorIds.has(doctor.id)) {
          seenDoctorIds.add(doctor.id);
          doctors.push({
            ...doctor,
            departmentRef: { name: symptom.department.name },
            matchedSymptom: symptom.name,
          });
        }
      }
    }

    return {
      symptoms: matchingSymptoms,
      doctors: doctors,
      message: doctors.length > 0 
        ? `Found ${doctors.length} doctors for "${query}"` 
        : `No doctors found for "${query}". Try searching for general symptoms like headache, fever, etc.`
    };
  }

  private async searchAll(searchQuery: SearchQueryDto) {
    const [hospitals, doctors, symptomsResult] = await Promise.all([
      this.searchHospitals({ ...searchQuery, type: SearchType.HOSPITALS }),
      this.searchDoctors({ ...searchQuery, type: SearchType.DOCTORS }),
      this.searchSymptoms({ ...searchQuery, type: SearchType.SYMPTOMS }),
    ]);

    // If searching by symptoms, prioritize symptom-based doctors
    let finalDoctors = doctors;
    let symptoms = [];
    let message = undefined;

    if (symptomsResult && typeof symptomsResult === 'object' && 'doctors' in symptomsResult) {
      if (symptomsResult.doctors && symptomsResult.doctors.length > 0) {
        finalDoctors = symptomsResult.doctors;
      }
      symptoms = symptomsResult.symptoms || [];
      message = symptomsResult.message;
    } else if (Array.isArray(symptomsResult)) {
      symptoms = symptomsResult.slice(0, 10);
    }

    return {
      hospitals: hospitals.slice(0, 10),
      doctors: finalDoctors.slice(0, 10),
      symptoms: symptoms,
      message: message,
    };
  }

  async getPopularSearches() {
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
          name: { contains: query },
        },
        select: { name: true },
        take: 5,
      }),
      this.prisma.doctor.findMany({
        where: {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
            { specialization: { contains: query } },
          ],
        },
        select: { firstName: true, lastName: true, specialization: true },
        take: 5,
      }),
      this.prisma.department.findMany({
        where: {
          name: { contains: query },
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
