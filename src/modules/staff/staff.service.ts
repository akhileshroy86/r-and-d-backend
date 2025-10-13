import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UserRole, AppointmentStatus, BookingStatus, PaymentStatus, PaymentMethod, HospitalStatus, QueueStatus } from '../../common/constants/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    try {
      console.log('Creating staff with data:', data);
      
      // Create user first
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: 'STAFF'
        }
      });
      
      // Create staff record
      const staff = await this.prisma.staff.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          position: data.position,
          isActive: true
        }
      });
      
      console.log('Staff created successfully:', staff.id);
      return { message: 'Staff created successfully', user, staff, password: data.password };
    } catch (error) {
      console.error('Staff creation failed:', error.message);
      console.error('Full error:', error);
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
      return { message: 'Staff updated successfully', staff: updatedStaff };
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  }

  async changePassword(staffId: string, currentPassword: string, newPassword: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true }
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, staff.user.password);
    if (!isCurrentPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in both user and staff tables
    await this.prisma.user.update({
      where: { id: staff.userId },
      data: { password: hashedNewPassword }
    });

    await this.prisma.staff.update({
      where: { id: staffId },
      data: { password: newPassword } // Store plain text in staff table for reference
    });

    return { message: 'Password changed successfully' };
  }

  async findByUserId(userId: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { userId },
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
}