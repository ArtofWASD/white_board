import { Module } from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { EventsController } from '../controllers/events.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
