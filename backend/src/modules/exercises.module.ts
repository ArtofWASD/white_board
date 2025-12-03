import { Module } from '@nestjs/common';
import { ExercisesController } from '../controllers/exercises.controller';
import { ExercisesService } from '../services/exercises.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
