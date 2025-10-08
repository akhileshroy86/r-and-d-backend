import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileUploadService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File, userId: string, type: 'profile' | 'document') {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', type);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${userId}-${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return {
      fileName,
      filePath: `/uploads/${type}/${fileName}`,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async deleteFile(filePath: string) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
