import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { EventsModule } from './modules/events.module';
import { TeamsModule } from './modules/teams.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, EventsModule, TeamsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
