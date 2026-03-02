import { Module } from '@nestjs/common';
import { ContentBlocksController } from '../controllers/content-blocks.controller';
import { ContentBlocksService } from '../services/content-blocks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../services/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [ContentBlocksController],
  providers: [ContentBlocksService],
})
export class ContentBlocksModule {}
