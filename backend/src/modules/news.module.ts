import { Module } from '@nestjs/common';
import { NewsController } from '../controllers/news.controller';
import { NewsService } from '../services/news.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService, PrismaService],
})
export class NewsModule {}
