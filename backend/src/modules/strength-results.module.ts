import { Module } from '@nestjs/common';
import { StrengthResultsService } from './strength-results.service';
import { StrengthResultsController } from './strength-results.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StrengthResultsController],
  providers: [StrengthResultsService],
})
export class StrengthResultsModule {}
