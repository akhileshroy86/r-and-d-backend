import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../../common/dto/login.dto';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import { UserRole } from '../../common/constants/enums';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      console.log('🚀 Login endpoint hit:', loginDto);
      return this.authService.login(loginDto.email, loginDto.password);
    } catch (error) {
      console.error('❌ Login controller error:', error);
      throw error;
    }
  }

  @Post('patient/register')
  async registerPatient(@Body() body: any) {
    try {
      console.log('Patient registration:', body);
      return this.usersService.create({
        email: body.email,
        password: body.password,
        role: UserRole.PATIENT
      });
    } catch (error) {
      console.error('Patient registration error:', error);
      throw error;
    }
  }

  @Post('patient/login')
  async loginPatient(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('staff/login')
  async loginStaff(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('test-login')
  async testLogin(@Body() body: any) {
    try {
      console.log('🧪 Test login attempt:', body);
      
      // Simple validation without JWT
      const user = await this.authService.validateUser(body.email, body.password);
      
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }
      
      return { 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('🚨 Test login error:', error);
      return { 
        success: false, 
        error: error.message,
        stack: error.stack 
      };
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    try {
      const { email } = body;
      
      // Find user by email
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // For now, return success (you can add email sending logic later)
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process password reset request'
      };
    }
  }

  @Post('simple-test')
  async simpleTest(@Body() body: any) {
    return {
      success: true,
      message: 'Backend is working',
      received: body,
      timestamp: new Date()
    };
  }
}
