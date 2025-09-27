import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PatientsService } from './patients.service';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post()
  async create(@Body() createPatientDto: {
    userId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    address?: string;
  }) {
    return this.patientsService.create({
      ...createPatientDto,
      dateOfBirth: new Date(createPatientDto.dateOfBirth),
    });
  }

  @Get()
  async findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }
}