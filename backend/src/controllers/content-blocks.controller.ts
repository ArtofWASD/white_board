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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ContentBlocksService } from '../services/content-blocks.service';
import { CreateContentBlockDto, UpdateContentBlockDto } from '../dtos/content-blocks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, ContentLocation } from '@prisma/client';

@Controller('content-blocks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentBlocksController {
  constructor(private readonly contentBlocksService: ContentBlocksService) {}

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
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentBlocksService.findOne(id);
  }

  @Post('upload')
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `block-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // file.filename represents the stored file
    return {
      imageUrl: `/uploads/${file.filename}`,
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
  remove(@Param('id') id: string) {
    return this.contentBlocksService.remove(id);
  }
}
