import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ContentExercisesService } from '../services/content-exercises.service';
import { CreateContentExerciseDto, UpdateContentExerciseDto } from '../dtos/content-exercises.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('content-exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentExercisesController {
  constructor(private contentExercisesService: ContentExercisesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: CreateContentExerciseDto) {
    return this.contentExercisesService.createContentExercise(dto.name, dto.description, dto.videoUrl);
  }

  @Get()
  async findAll() {
    return this.contentExercisesService.getAllContentExercises();
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UsePipes(new ValidationPipe())
  async update(@Param('id') id: string, @Body() dto: UpdateContentExerciseDto) {
    return this.contentExercisesService.updateContentExercise(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  async remove(@Param('id') id: string) {
    return this.contentExercisesService.deleteContentExercise(id);
  }
}
