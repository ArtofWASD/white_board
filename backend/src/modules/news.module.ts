import { Module } from '@nestjs/common';
import { NewsController } from '../controllers/news.controller';
import { NewsService } from '../services/news.service';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../services/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
