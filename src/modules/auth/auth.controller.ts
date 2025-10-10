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
    return this.authService.login(loginDto.email, loginDto.password);
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
}
