import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ContentBlocksService } from '../services/content-blocks.service';
import { S3Service } from '../services/s3.service';
import {
  CreateContentBlockDto,
  UpdateContentBlockDto,
} from '../dtos/content-blocks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, ContentLocation } from '@prisma/client';

@Controller('content-blocks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentBlocksController {
  constructor(
    private readonly contentBlocksService: ContentBlocksService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDto: CreateContentBlockDto) {
    return this.contentBlocksService.create(createDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAllAdmin() {
    return this.contentBlocksService.findAll();
  }

  @Public()
  @Get('public')
  findActiveByLocation(@Query('location') location: ContentLocation) {
    if (!location) {
      return [];
    }
    return this.contentBlocksService.findActiveByLocation(location);
  }

  @Public()
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.contentBlocksService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentBlocksService.findOne(id);
  }

  @Post('upload')
  @Roles(UserRole.SUPER_ADMIN)
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
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload file to S3
    const imageUrl = await this.s3Service.uploadFile(file, 'content-blocks');

    return {
      imageUrl,
    };
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateDto: UpdateContentBlockDto) {
    return this.contentBlocksService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.contentBlocksService.remove(id);
    return;
  }
}
