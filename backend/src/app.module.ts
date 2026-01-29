import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { EventsModule } from './modules/events.module';
import { TeamsModule } from './modules/teams.module';
import { ExercisesModule } from './modules/exercises.module';
import { StrengthResultsModule } from './modules/strength-results.module';
import { OrganizationModule } from './modules/organization.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users.module';
import { SettingsModule } from './modules/settings.module';
import { StatisticsModule } from './modules/statistics.module';
import { WodsModule } from './modules/wods.module';
import { ContentExercisesModule } from './modules/content-exercises.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule, 
    AuthModule, 
    EventsModule, 
    TeamsModule, 
    ExercisesModule, 
    StrengthResultsModule, 
    OrganizationModule,
    UsersModule,
    SettingsModule,

    StatisticsModule,
    WodsModule,
    ContentExercisesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
