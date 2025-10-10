import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalsService.create(createHospitalDto);
  }

  @Get()
  findAll(@Query('city') city?: string) {
    return this.hospitalsService.findAll(city);
  }

  @Get('nearby')
  findNearby(
    @Query('lat') latitude: string,
    @Query('lng') longitude: string,
    @Query('radius') radius?: string,
  ) {
    return this.hospitalsService.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      radius ? parseInt(radius) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hospitalsService.findOne(id);
  }
}
