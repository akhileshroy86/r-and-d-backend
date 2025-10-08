import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';
import { PrismaService } from '../../config/prisma.service';

@Controller('staff')
export class StaffController {

  @Post('open')
  openCreate(@Body() body: any) {
    console.log('=== OPEN ENDPOINT HIT ===');
    console.log('Body:', body);
    return { success: true, received: body };
  }
  constructor(
    private readonly staffService: StaffService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async create(@Body() body: any) {
    console.log('=== STAFF CONTROLLER HIT ===');
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('Body keys:', Object.keys(body || {}));
    
    try {
      const result = await this.staffService.create(body);
      console.log('=== CONTROLLER SUCCESS ===');
      return result;
    } catch (error) {
      console.log('=== CONTROLLER ERROR ===');
      console.error(error);
      throw error;
    }
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  findAll() {
    return this.staffService.findAll();
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      console.log('=== STAFF UPDATE REQUEST ===');
      console.log('Staff ID:', id);
      console.log('Update data:', JSON.stringify(body, null, 2));
      
      const result = await this.staffService.update(id, body);
      console.log('Staff update successful');
      return result;
    } catch (error) {
      console.error('=== STAFF UPDATE ERROR ===');
      console.error('Error:', error);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  activate(@Param('id') id: string) {
    return this.staffService.updateStatus(id, true);
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.staffService.updateStatus(id, false);
  }

  @Get('debug/check')
  async debugCheck() {
    const users = await this.prisma.user.findMany({ where: { role: 'STAFF' } });
    const staff = await this.prisma.staff.findMany();
    return { users, staff, userCount: users.length, staffCount: staff.length };
  }

  @Put('test/:id')
  testPut(@Param('id') id: string, @Body() body: any) {
    console.log('TEST PUT HIT - ID:', id);
    console.log('TEST PUT BODY:', body);
    return { message: 'PUT route working', id, body };
  }

  @Get('test')
  test() {
    console.log('TEST ENDPOINT HIT');
    return { message: 'Staff endpoint working', timestamp: new Date() };
  }
}
