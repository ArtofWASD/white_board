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
} from '@nestjs/common';
import { ContentExercisesService } from '../services/content-exercises.service';
import { CreateContentExerciseDto, UpdateContentExerciseDto } from '../dtos/content-exercises.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('content-exercises')
export class ContentExercisesController {
  constructor(private contentExercisesService: ContentExercisesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: CreateContentExerciseDto) {
    return this.contentExercisesService.createContentExercise(dto.name, dto.description, dto.videoUrl, dto.muscleGroups);
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
