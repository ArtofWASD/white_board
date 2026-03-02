import { Module } from '@nestjs/common';
import { ContentExercisesController } from '../controllers/content-exercises.controller';
import { ContentExercisesService } from '../services/content-exercises.service';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../services/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [ContentExercisesController],
  providers: [ContentExercisesService],
  exports: [ContentExercisesService],
})
export class ContentExercisesModule {}
