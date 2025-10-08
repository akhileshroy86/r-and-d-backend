import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(createStaffDto: any) {
    try {
      console.log('=== STAFF CREATION START ===');
      console.log('Input data:', JSON.stringify(createStaffDto, null, 2));
      
      const password = createStaffDto.fullName.replace(/\s+/g, '').toLowerCase();
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password generated:', password);
      
      const user = await this.prisma.user.create({
        data: {
          email: createStaffDto.email,
          password: hashedPassword,
          role: UserRole.STAFF,
        },
      });
      
      console.log('User created with ID:', user.id);
      
      const staff = await this.prisma.staff.create({
        data: {
          userId: user.id,
          fullName: createStaffDto.fullName,
          email: createStaffDto.email,
          phone: createStaffDto.phoneNumber,
          password: password,
          position: createStaffDto.position,
          isActive: createStaffDto.isActive || true,
        },
      });
      
      console.log('Staff created with ID:', staff.id);
      
      // Immediately verify the data was saved
      const verifyUser = await this.prisma.user.findUnique({ where: { id: user.id } });
      const verifyStaff = await this.prisma.staff.findUnique({ where: { id: staff.id } });
      
      console.log('Verification - User found:', !!verifyUser);
      console.log('Verification - Staff found:', !!verifyStaff);
      
      // Count all records
      const userCount = await this.prisma.user.count({ where: { role: 'STAFF' } });
      const staffCount = await this.prisma.staff.count();
      
      console.log('Total STAFF users:', userCount);
      console.log('Total staff records:', staffCount);
      console.log('=== STAFF CREATION SUCCESS ===');
      
      return { 
        message: 'Staff created successfully', 
        user, 
        staff, 
        verification: { verifyUser: !!verifyUser, verifyStaff: !!verifyStaff },
        counts: { userCount, staffCount }
      };
    } catch (error) {
      console.error('=== STAFF CREATION ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return staff;
  }

  async updateStatus(id: string, isActive: boolean) {
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return this.prisma.staff.update({
      where: { id },
      data: { isActive },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, updateData: any) {
    try {
      console.log('Updating staff with ID:', id);
      console.log('Update data:', updateData);
      
      const staff = await this.prisma.staff.findUnique({ 
        where: { id },
        include: { user: true }
      });
      
      if (!staff) {
        throw new NotFoundException('Staff member not found');
      }

      // Update user table if email changed
      if (updateData.email && updateData.email !== staff.email) {
        await this.prisma.user.update({
          where: { id: staff.userId },
          data: { email: updateData.email }
        });
      }

      // Update staff table
      const updatedStaff = await this.prisma.staff.update({
        where: { id },
        data: {
          fullName: updateData.fullName || staff.fullName,
          email: updateData.email || staff.email,
          phone: updateData.phoneNumber || updateData.phone || staff.phone,
          position: updateData.position || staff.position,
          isActive: updateData.isActive !== undefined ? updateData.isActive : staff.isActive,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });
      
      console.log('Staff updated successfully:', updatedStaff.id);
      
      // Verify the update by fetching the record again
      const verifyStaff = await this.prisma.staff.findUnique({
        where: { id },
        include: { user: true }
      });
      
      console.log('Verification - Updated staff data:', JSON.stringify(verifyStaff, null, 2));
      
      return { 
        message: 'Staff updated successfully', 
        staff: updatedStaff,
        verification: verifyStaff
      };
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  }
}
