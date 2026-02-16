import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StrengthResultsService } from './strength-results.service';

@Controller('strength-results')
export class StrengthResultsController {
  constructor(
    private readonly strengthResultsService: StrengthResultsService,
  ) {}

  @Post()
  create(
    @Body()
    createDto: {
      userId: string;
      exerciseId: string;
      date: Date;
      week: number;
      weight: number;
      reps: number;
    },
  ) {
    return this.strengthResultsService.create(createDto);
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: string) {
    return this.strengthResultsService.findByUser(userId);
  }

  @Get(':userId/:exerciseId')
  findByUserAndExercise(
    @Param('userId') userId: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.strengthResultsService.findByUserAndExercise(
      userId,
      exerciseId,
    );
  }
}
