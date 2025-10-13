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

  @Post(':id/change-password')
  async changePassword(@Param('id') id: string, @Body() body: any) {
    const { currentPassword, newPassword } = body;
    return this.staffService.changePassword(id, currentPassword, newPassword);
  }

  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string) {
    return this.staffService.findByUserId(userId);
  }

  @Get('login-credentials/:email')
  async getLoginCredentials(@Param('email') email: string) {
    const staff = await this.prisma.staff.findFirst({
      where: { email },
      include: { user: true }
    });
    
    if (!staff) {
      return { error: 'Staff not found' };
    }
    
    return {
      email: staff.email,
      password: staff.password,
      fullName: staff.fullName,
      position: staff.position,
      phone: staff.phone,
      isActive: staff.isActive,
      userId: staff.userId
    };
  }

  @Get('all-staff-credentials')
  async getAllStaffCredentials() {
    const allStaff = await this.prisma.staff.findMany({
      include: { user: true }
    });
    
    return allStaff.map(staff => ({
      id: staff.id,
      email: staff.email,
      password: staff.password,
      fullName: staff.fullName,
      position: staff.position,
      phone: staff.phone,
      isActive: staff.isActive
    }));
  }

  @Get('debug/database-check')
  async debugDatabaseCheck() {
    const users = await this.prisma.user.findMany({ where: { role: 'STAFF' } });
    const staff = await this.prisma.staff.findMany({ include: { user: true } });
    
    return {
      totalStaffUsers: users.length,
      totalStaffRecords: staff.length,
      staffUsers: users,
      staffRecords: staff
    };
  }

  @Post('test-create-and-login')
  async testCreateAndLogin(@Body() body: any) {
    try {
      // Step 1: Create staff
      const staffData = {
        fullName: body.fullName || 'Test Staff',
        email: body.email || `test${Date.now()}@hospital.com`,
        phoneNumber: body.phone || '+1234567890',
        position: body.position || 'Nurse',
        isActive: true
      };
      
      console.log('Creating staff:', staffData);
      const createResult = await this.staffService.create(staffData);
      
      // Step 2: Get login credentials
      const password = staffData.fullName.replace(/\s+/g, '').toLowerCase();
      
      // Step 3: Test login immediately
      const loginResponse = await fetch('http://localhost:3002/api/v1/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staffData.email,
          password: password
        })
      });
      
      const loginResult = await loginResponse.json();
      
      return {
        step1_creation: {
          success: true,
          staff: createResult.staff,
          user: createResult.user
        },
        step2_credentials: {
          email: staffData.email,
          password: password
        },
        step3_login_test: {
          success: loginResponse.ok,
          result: loginResult
        }
      };
    } catch (error) {
      return {
        error: error.message,
        details: error
      };
    }
  }
}
