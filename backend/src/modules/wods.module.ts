import { Module } from '@nestjs/common';
import { WodsService } from '../services/wods.service';
import { WodsController } from '../controllers/wods.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WodsController],
  providers: [WodsService],
  exports: [WodsService],
})
export class WodsModule {}
