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
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('🔐 Password valid:', isPasswordValid);
      
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error in validateUser:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      console.log('🚀 Login attempt:', email);
      const user = await this.validateUser(email, password);
      
      if (!user) {
        console.log('❌ Authentication failed for:', email);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      console.log('✅ Authentication successful for:', email);
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
