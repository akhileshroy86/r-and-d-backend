import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { StaffService } from './staff.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/enums';

@Controller('staff/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STAFF)
export class StaffSettingsController {
  constructor(private readonly staffService: StaffService) {}

  @Post('change-password')
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    console.log('\n🚨 STAFF SETTINGS PASSWORD CHANGE 🚨');
    console.log('Endpoint: /staff/settings/change-password');
    console.log('User:', req.user);
    console.log('Body:', JSON.stringify(changePasswordDto, null, 2));
    
    try {
      const staff = await this.staffService.findByUserId(req.user.sub);
      console.log('✅ Found staff:', staff.email);
      const result = await this.staffService.changePassword(staff.id, changePasswordDto.currentPassword, changePasswordDto.newPassword);
      console.log('✅ Success:', result);
      return result;
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      return { success: false, message: error.message };
    }
  }

  @Post('change-password-simple')
  async changePasswordSimple(@Body() body: any) {
    console.log('🔐 Simple staff password change request');
    console.log('📝 Body:', body);
    
    const { email, currentPassword, newPassword } = body;
    
    if (!email) {
      return { success: false, message: 'Email is required' };
    }
    
    try {
      return await this.staffService.changePasswordByEmail(email, currentPassword, newPassword);
    } catch (error) {
      console.log('❌ Simple password change failed:', error.message);
      return { success: false, message: error.message };
    }
  }
}