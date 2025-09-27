import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StaffService } from './staff.service';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Post()
  async create(@Body() createStaffDto: {
    userId: string;
    firstName: string;
    lastName: string;
    position: string;
    phone: string;
  }) {
    return this.staffService.create(createStaffDto);
  }

  @Get()
  async findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }
}