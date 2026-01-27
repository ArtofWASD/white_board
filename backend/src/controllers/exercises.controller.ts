import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  BadRequestException,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ExercisesService } from '../services/exercises.service';
import { CreateExerciseDto, AddExerciseRecordDto, CreateGlobalExerciseDto, UpdateExerciseDto } from '../dtos/exercises.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('exercises')
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Get('ping')
  ping() {
    return { message: 'pong' };
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createExercise(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.createExercise(
      createExerciseDto.userId,
      createExerciseDto.name,
      createExerciseDto.initialWeight,
    );
  }

  @Post('global')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  async createGlobalExercise(@Body() dto: CreateGlobalExerciseDto) {
      return this.exercisesService.createGlobalExercise(dto.name, dto.description, dto.videoUrl);
  }

  @Get('global')
  async getGlobalExercises() {
      return this.exercisesService.getGlobalExercises();
  }

  @Put('global/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  async updateExerciseDetails(@Param('id') id: string, @Body() dto: UpdateExerciseDto) {
      return this.exercisesService.updateExerciseDetails(id, dto);
  }

  @Delete('global/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  async deleteExercise(@Param('id') id: string) {
      return this.exercisesService.deleteExercise(id);
  }

  @Get(':userId')
  async getExercises(@Param('userId') userId: string) {
    return this.exercisesService.getExercisesByUserId(userId);
  }

  @Post(':id/records')
  @UsePipes(new ValidationPipe())
  async addRecord(
    @Param('id') id: string,
    @Body() addRecordDto: AddExerciseRecordDto,
  ) {
    try {
      return await this.exercisesService.addExerciseRecord(
        id,
        addRecordDto.weight,
        addRecordDto.date,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to add record');
    }
  }

  @Get(':id/records')
  async getRecords(@Param('id') id: string) {
    return this.exercisesService.getExerciseRecords(id);
  }

  @Put(':id')
  async updateExercise(
    @Param('id') id: string,
    @Body('name') name: string,
  ) {
    return this.exercisesService.updateExercise(id, name);
  }
}
