import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ContentExercisesService } from '../services/content-exercises.service';
import { S3Service } from '../services/s3.service';
import {
  CreateContentExerciseDto,
  UpdateContentExerciseDto,
} from '../dtos/content-exercises.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('content-exercises')
export class ContentExercisesController {
  constructor(
    private contentExercisesService: ContentExercisesService,
    private s3Service: S3Service,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: CreateContentExerciseDto) {
    return this.contentExercisesService.createContentExercise(dto);
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
    const imageUrl = await this.s3Service.uploadFile(file, 'content-exercises');
    return { imageUrl };
  }

  @Get()
  async findAll() {
    return this.contentExercisesService.getAllContentExercises();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contentExercisesService.getContentExerciseById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() dto: UpdateContentExerciseDto) {
    return this.contentExercisesService.updateContentExercise(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  async remove(@Param('id') id: string) {
    return this.contentExercisesService.deleteContentExercise(id);
  }

  @Public()
  @Patch(':id/rate')
  updateRating(@Param('id') id: string, @Body('delta') delta: number) {
    return this.contentExercisesService.updateRating(id, delta);
  }
}
