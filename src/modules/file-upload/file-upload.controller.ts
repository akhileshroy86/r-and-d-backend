import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Request, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('file-upload')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePicture(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.fileUploadService.uploadFile(file, req.user.id, 'profile');
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.fileUploadService.uploadFile(file, req.user.id, 'document');
  }
}
