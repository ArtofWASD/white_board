import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NewsService } from '../services/news.service';
import { S3Service } from '../services/s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  getAll(@Query('limit') limit?: number) {
    return this.newsService.getAll(limit);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.newsService.getOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  create(
    @Body()
    body: {
      title: string;
      content: string;
      excerpt?: string;
      imageUrl?: string;
      createdAt?: string;
    },
  ) {
    return this.newsService.create(body);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const imageUrl = await this.s3Service.uploadFile(file, 'news');
    return { imageUrl };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      content?: string;
      excerpt?: string;
      imageUrl?: string;
      createdAt?: string;
    },
  ) {
    return this.newsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}
