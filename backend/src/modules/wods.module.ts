import { Module } from '@nestjs/common';
import { WodsService } from '../services/wods.service';
import { WodsController } from '../controllers/wods.controller';
import { PublicWodsController } from '../controllers/public-wods.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WodsController, PublicWodsController],
  providers: [WodsService],
  exports: [WodsService],
})
export class WodsModule {}
