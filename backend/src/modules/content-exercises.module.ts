import { Module } from '@nestjs/common';
import { ContentExercisesController } from '../controllers/content-exercises.controller';
import { ContentExercisesService } from '../services/content-exercises.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContentExercisesController],
  providers: [ContentExercisesService],
  exports: [ContentExercisesService],
})
export class ContentExercisesModule {}
