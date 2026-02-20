import { Module } from '@nestjs/common';
import { ContentBlocksController } from '../controllers/content-blocks.controller';
import { ContentBlocksService } from '../services/content-blocks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContentBlocksController],
  providers: [ContentBlocksService],
})
export class ContentBlocksModule {}
