import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Post()
  async create(@Body() createDoctorDto: {
    userId: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    phone: string;
  }) {
    return this.doctorsService.create(createDoctorDto);
  }

  @Get()
  async findAll() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }
}