import { Module } from '@nestjs/common';
import { NotificationsController } from '../../controllers/notifications.controller';
import { NotificationsService } from '../../services/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
