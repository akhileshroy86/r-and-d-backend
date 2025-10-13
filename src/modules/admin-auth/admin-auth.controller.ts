import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.adminAuthService.signUp(signUpDto);
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    return this.adminAuthService.signIn(signInDto);
  }

  @Post('signout')
  @UseGuards(AdminAuthGuard)
  async signOut() {
    return { message: 'Signed out successfully' };
  }

  @Get('verify')
  @UseGuards(AdminAuthGuard)
  async verify(@Request() req) {
    return { user: req.user, message: 'Token is valid' };
  }

  @Get('profile')
  @UseGuards(AdminAuthGuard)
  async getProfile(@Request() req) {
    return { user: req.user };
  }

  @Put('profile')
  @UseGuards(AdminAuthGuard)
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.adminAuthService.updateProfile(req.user.id, updateProfileDto);
  }

  @Put('change-password')
  @UseGuards(AdminAuthGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.adminAuthService.changePassword(req.user.id, changePasswordDto);
  }
}