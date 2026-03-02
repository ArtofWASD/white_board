import { Module } from '@nestjs/common';
import { WodsService } from '../services/wods.service';
import { WodsController } from '../controllers/wods.controller';
import { PublicWodsController } from '../controllers/public-wods.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../services/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [WodsController, PublicWodsController],
  providers: [WodsService],
  exports: [WodsService],
})
export class WodsModule {}
