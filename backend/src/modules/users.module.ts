import { Module } from '@nestjs/common';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../services/s3.module';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
