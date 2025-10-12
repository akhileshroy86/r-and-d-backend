import { Controller, Post, Body } from '@nestjs/common';
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
    return this.authService.login(loginDto.email, loginDto.password);
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
}
