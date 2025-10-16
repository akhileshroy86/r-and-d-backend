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
      
      // Check if email already exists in users table
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email }
      });
      
      let user;
      if (existingUser) {
        // If user exists, create a unique email for staff user record
        const staffEmail = `staff_${Date.now()}_${data.email}`;
        const hashedPassword = await bcrypt.hash(data.password, 10);
        user = await this.prisma.user.create({
          data: {
            email: staffEmail,
            password: hashedPassword,
            role: 'STAFF'
          }
        });
        console.log('Created unique user record for staff:', staffEmail);
      } else {
        // Create user with original email
        const hashedPassword = await bcrypt.hash(data.password, 10);
        user = await this.prisma.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            role: 'STAFF'
          }
        });
      }
      
      // Create staff record with original email
      const staff = await this.prisma.staff.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          email: data.email, // Keep original email for staff login
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
    console.log('🔍 changePassword called with staffId:', staffId);
    console.log('🔍 currentPassword:', currentPassword);
    console.log('🔍 newPassword:', newPassword);
    
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true }
    });

    console.log('🔍 Staff found:', !!staff);
    if (staff) {
      console.log('🔍 Staff details:', {
        id: staff.id,
        email: staff.email,
        fullName: staff.fullName,
        password: staff.password
      });
    }

    if (!staff) {
      console.log('❌ Staff not found with ID:', staffId);
      
      // Try to find by email in case staffId is actually an email
      console.log('🔍 Trying to find by email...');
      const staffByEmail = await this.prisma.staff.findFirst({
        where: { email: staffId },
        include: { user: true }
      });
      
      if (staffByEmail) {
        console.log('✅ Found staff by email instead:', staffByEmail.email);
        // Recursively call with the correct ID
        return this.changePassword(staffByEmail.id, currentPassword, newPassword);
      }
      
      // Try to find by userId in case staffId is actually a userId
      console.log('🔍 Trying to find by userId...');
      const staffByUserId = await this.prisma.staff.findFirst({
        where: { userId: staffId },
        include: { user: true }
      });
      
      if (staffByUserId) {
        console.log('✅ Found staff by userId instead:', staffByUserId.email);
        // Recursively call with the correct ID
        return this.changePassword(staffByUserId.id, currentPassword, newPassword);
      }
      
      console.log('❌ Staff not found with any identifier:', staffId);
      throw new NotFoundException(`Staff member not found with identifier: ${staffId}`);
    }

    // Verify current password against the plain text password in staff table
    if (staff.password !== currentPassword) {
      throw new ConflictException('Current password is incorrect');
    }

    // Update staff table password
    await this.prisma.staff.update({
      where: { id: staffId },
      data: { password: newPassword }
    });

    // Create or update dedicated user record for this staff
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const staffUserEmail = `staff_${staffId}_${staff.email}`;
    
    // Try to find existing dedicated user record
    const existingStaffUser = await this.prisma.user.findUnique({
      where: { email: staffUserEmail }
    });

    if (existingStaffUser) {
      // Update existing dedicated user record
      await this.prisma.user.update({
        where: { email: staffUserEmail },
        data: { password: hashedNewPassword }
      });
    } else {
      // Create new dedicated user record
      const newUser = await this.prisma.user.create({
        data: {
          email: staffUserEmail,
          password: hashedNewPassword,
          role: 'STAFF'
        }
      });
      
      // Update staff to point to new user record
      await this.prisma.staff.update({
        where: { id: staffId },
        data: { userId: newUser.id }
      });
    }

    console.log('✅ Password updated successfully for staff:', staff.email);
    console.log('🔐 Staff table password updated');
    console.log('🔐 Dedicated user record created/updated');

    return { message: 'Password changed successfully' };
  }

  async changePasswordByEmail(email: string, currentPassword: string, newPassword: string) {
    console.log('🔍 changePasswordByEmail called with email:', email);
    
    const staff = await this.prisma.staff.findFirst({
      where: { email },
      include: { user: true }
    });

    if (!staff) {
      console.log('❌ Staff not found with email:', email);
      throw new NotFoundException('Staff member not found');
    }

    console.log('✅ Staff found:', staff.fullName);
    return this.changePassword(staff.id, currentPassword, newPassword);
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