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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { WodsService } from '../services/wods.service';
import { S3Service } from '../services/s3.service';
import { CreateWodDto, UpdateWodDto } from '../dtos/wods.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('wods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WodsController {
  constructor(
    private readonly wodsService: WodsService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UsePipes(new ValidationPipe())
  create(@Body() createWodDto: CreateWodDto) {
    return this.wodsService.create(createWodDto);
  }

  @Post('upload-image')
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
    const imageUrl = await this.s3Service.uploadFile(file, 'wods');
    return { imageUrl };
  }

  @Public()
  @Get()
  findAll() {
    return this.wodsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wodsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() updateWodDto: UpdateWodDto) {
    return this.wodsService.update(id, updateWodDto);
  }

  @Public()
  @Patch(':id/rate')
  updateRating(@Param('id') id: string, @Body('delta') delta: number) {
    return this.wodsService.updateRating(id, delta);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  remove(@Param('id') id: string) {
    return this.wodsService.remove(id);
  }
}
