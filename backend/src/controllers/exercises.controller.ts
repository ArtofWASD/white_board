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
} from '@nestjs/common';
import { ExercisesService } from '../services/exercises.service';
import { CreateExerciseDto, AddExerciseRecordDto } from '../dtos/exercises.dto';

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
}
