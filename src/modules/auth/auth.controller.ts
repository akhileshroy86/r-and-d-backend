import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PatientsService } from '../patients/patients.service';
import { LoginDto } from '../../common/dto/login.dto';
import { CreateUserDto } from '../../common/dto/create-user.dto';
import { UserRole } from '../../common/constants/enums';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly patientsService: PatientsService,
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

  @Post('register')
  async register(@Body() body: any) {
    try {
      console.log('Patient registration:', body);
      
      // Create user first
      const user = await this.usersService.create({
        email: body.email,
        password: body.password,
        role: UserRole.PATIENT
      });
      
      // Create patient record
      const patient = await this.usersService.createPatientRecord(user.id, {
        firstName: body.name?.split(' ')[0] || 'Patient',
        lastName: body.name?.split(' ').slice(1).join(' ') || 'User',
        phone: body.phone || `+91${Date.now().toString().slice(-10)}`,
        dateOfBirth: body.dateOfBirth || new Date('1990-01-01'),
        address: body.address || 'Not provided'
      });
      
      return {
        success: true,
        user: {
          ...user,
          patientId: patient.id
        }
      };
    } catch (error) {
      console.error('Patient registration error:', error);
      throw error;
    }
  }

  @Post('patient/register')
  async registerPatient(@Body() body: any) {
    return this.register(body);
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

  @Post('staff/update-password/:staffId')
  async updateStaffPasswordById(@Param('staffId') staffId: string, @Body() body: any) {
    try {
      const { newPassword } = body;
      
      // Find staff by ID to get email
      const staff = await this.usersService.findStaffByEmailDirect(staffId);
      if (!staff) {
        return { success: false, message: 'Staff not found' };
      }
      
      await this.usersService.updateStaffPasswordComplete(staff.email, newPassword);
      
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Get('staff/list-all')
  async listAllStaff() {
    try {
      const staff = await this.usersService.getAllStaff();
      return {
        success: true,
        staff: staff.map(s => ({
          id: s.id,
          fullName: s.fullName,
          email: s.email,
          password: s.password,
          position: s.position
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  @Post('staff/change-password')
  async staffChangePassword(@Body() body: any) {
    try {
      console.log('\n\n🚨 AUTH STAFF PASSWORD CHANGE 🚨');
      console.log('Endpoint: /auth/staff/change-password');
      console.log('Body:', JSON.stringify(body, null, 2));
      
      const { email, currentPassword, newPassword } = body;
      
      if (!email || !currentPassword || !newPassword) {
        console.log('❌ Missing required fields');
        return { success: false, message: 'Missing email, currentPassword, or newPassword' };
      }
      
      // Find staff by email (same table used for login)
      console.log('🔍 Looking for staff with email:', email);
      const staff = await this.usersService.findStaffByEmailDirect(email);
      
      if (!staff) {
        console.log('❌ Staff not found for email:', email);
        return { success: false, message: 'User not found' };
      }
      
      console.log('✅ Staff found:', staff.fullName);
      console.log('🔐 Current stored password:', staff.password);
      console.log('🔐 Provided current password:', currentPassword);
      
      // Check current password against staff table (plain text)
      if (staff.password !== currentPassword) {
        console.log('❌ Password mismatch - stored:', staff.password, 'provided:', currentPassword);
        return { success: false, message: 'Current password is incorrect' };
      }
      
      console.log('✅ Password matches, updating both tables...');
      
      // Update only staff table (same as login authentication)
      await this.usersService.updateStaffPasswordDirect(staff.id, newPassword);
      
      console.log('✅ 🔴 PASSWORD UPDATED SUCCESSFULLY IN DATABASE 🔴');
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      console.error('❌ Staff change password error:', error);
      return {
        success: false,
        message: error.message || 'Failed to change password'
      };
    }
  }

  @Post('change-password')
  async changePassword(@Body() body: any) {
    try {
      console.log('🔐 Staff-only password change request:', body);
      const { email, currentPassword, newPassword } = body;
      
      // Find staff by email and validate current password
      console.log('🔍 Looking for staff with email:', email);
      const staff = await this.usersService.findStaffByEmailDirect(email);
      
      if (!staff) {
        console.log('❌ Staff not found for email:', email);
        return { success: false, message: 'Staff not found' };
      }
      
      console.log('✅ Staff found:', staff.fullName, 'Stored password:', staff.password);
      
      // Check current password against staff table (plain text)
      if (staff.password !== currentPassword) {
        console.log('❌ Password mismatch');
        return { success: false, message: 'Current password is incorrect' };
      }
      
      console.log('✅ Password matches, updating ONLY staff table...');
      
      // Update ONLY staff table
      await this.usersService.updateStaffPasswordDirect(staff.id, newPassword);
      
      console.log('✅ Staff password updated successfully');
      
      return {
        success: true,
        message: 'Staff password changed successfully'
      };
    } catch (error) {
      console.error('❌ Staff password change error:', error);
      return {
        success: false,
        message: 'Failed to change staff password: ' + error.message
      };
    }
  }

  @Get('debug/users')
  async debugUsers() {
    const users = await this.usersService.findAll();
    return { users, count: users.length };
  }

  @Get('debug/all-staff-passwords')
  async debugAllStaffPasswords() {
    try {
      const allStaff = await this.usersService.getAllStaff();
      
      return {
        totalStaff: allStaff.length,
        staff: allStaff.map(staff => ({
          id: staff.id,
          fullName: staff.fullName,
          email: staff.email,
          password: staff.password,
          position: staff.position,
          isActive: staff.isActive
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('debug/staff-info')
  async debugStaffInfo(@Body() body: any) {
    try {
      const { email } = body;
      
      const staff = await this.usersService.findStaffByEmail(email);
      const user = await this.usersService.findByEmail(email);
      
      return {
        email,
        staffFound: !!staff,
        userFound: !!user,
        staffData: staff ? {
          id: staff.id,
          fullName: staff.fullName,
          email: staff.email,
          password: staff.password,
          position: staff.position,
          isActive: staff.isActive
        } : null,
        userData: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('fix-staff-user')
  async fixStaffUser(@Body() body: any) {
    try {
      const { email, password } = body;
      
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(email);
      if (existingUser) {
        return { success: false, message: 'User already exists' };
      }
      
      // Create user record
      const hashedPassword = await this.usersService.hashPassword(password);
      const user = await this.usersService.create({
        email,
        password,
        role: UserRole.STAFF
      });
      
      return {
        success: true,
        message: 'User record created successfully',
        user
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
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

  @Post('debug/test-password')
  async testPassword(@Body() body: any) {
    try {
      const { email, password } = body;
      console.log('🧪 Testing password for:', email);
      
      // Get user from user table
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found in user table' };
      }
      
      // Get staff from staff table
      const staff = await this.usersService.findStaffByEmailDirect(email);
      
      // Test password comparison
      const bcrypt = require('bcrypt');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      return {
        success: true,
        userFound: !!user,
        staffFound: !!staff,
        userPassword: user.password.substring(0, 20) + '...',
        staffPassword: staff?.password || 'N/A',
        inputPassword: password,
        passwordValid: isPasswordValid,
        userRole: user.role,
        message: isPasswordValid ? 'Password is correct' : 'Password is incorrect'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Post('debug/fix-password')
  async fixPassword(@Body() body: any) {
    try {
      const { email, newPassword } = body;
      console.log('🔧 Fixing password for:', email);
      
      // Use the complete password update method
      const result = await this.usersService.updateStaffPasswordComplete(email, newPassword);
      
      return {
        success: true,
        message: 'Password fixed successfully',
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('debug/log-request')
  async logRequest(@Body() body: any) {
    console.log('📝 Frontend Request Received:');
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('Timestamp:', new Date().toISOString());
    
    return {
      success: true,
      message: 'Request logged',
      received: body
    };
  }

  @Get('debug/all-staff-passwords-v2')
  async getAllStaffPasswords() {
    try {
      const allStaff = await this.usersService.findAll();
      const staffRecords = await this.usersService.findAllStaff();
      
      return {
        success: true,
        users: allStaff,
        staffRecords: staffRecords,
        message: 'All staff data retrieved'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
