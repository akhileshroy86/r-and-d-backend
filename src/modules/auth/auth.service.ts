import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      console.log('🔍 Validating user:', email);
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        console.log('❌ User not found:', email);
        return null;
      }
      
      console.log('✅ User found:', user.email, 'Role:', user.role);
      console.log('🔐 Stored password hash:', user.password.substring(0, 20) + '...');
      console.log('🔐 Input password:', password);
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('🔐 Password comparison result:', isPasswordValid);
      
      if (isPasswordValid) {
        const { password, ...result } = user;
        console.log('✅ Authentication successful, returning user data');
        return result;
      }
      
      console.log('❌ Password comparison failed');
      return null;
    } catch (error) {
      console.error('❌ Error in validateUser:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      console.log('🚀 Login attempt:', email);
      
      // First try staff login using staff table (this takes priority)
      const staff = await this.usersService.findStaffByEmail(email);
      if (staff) {
        console.log('\n\n🔥 STAFF LOGIN ATTEMPT 🔥');
        console.log('='.repeat(50));
        console.log('👥 Found staff record for:', email);
        console.log('📝 Staff ID:', staff.id);
        console.log('📝 Staff Name:', staff.fullName);
        console.log('📝 Staff Position:', staff.position);
        console.log('🔐 Staff table password:', staff.password);
        console.log('🔐 Input password:', password);
        console.log('🔐 Password match:', staff.password === password);
        console.log('='.repeat(50));
        
        if (staff.password === password) {
          console.log('✅ 🎉 STAFF AUTHENTICATION SUCCESSFUL 🎉');
          const payload = { email: staff.email, sub: staff.userId, role: 'STAFF' };
          return {
            access_token: this.jwtService.sign(payload),
            user: {
              id: staff.userId,
              email: staff.email,
              role: 'STAFF',
              staffId: staff.id,
              fullName: staff.fullName,
              position: staff.position
            },
          };
        } else {
          console.log('❌ 🚫 STAFF PASSWORD MISMATCH 🚫');
          console.log('Expected:', staff.password);
          console.log('Received:', password);
          throw new UnauthorizedException('Invalid credentials');
        }
      }
      
      // If not staff, try regular user login (for admin, patients, etc.)
      console.log('👤 No staff record found, trying user table');
      const user = await this.validateUser(email, password);
      
      if (!user) {
        console.log('❌ Authentication failed for:', email);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      console.log('✅ User authentication successful for:', email);
      const payload = { email: user.email, sub: user.id, role: user.role };
      
      return {
        access_token: this.jwtService.sign(payload),
        user,
      };
    } catch (error) {
      console.error('❌ Error in login:', error);
      throw error;
    }
  }
}
