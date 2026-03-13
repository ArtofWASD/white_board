import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { jwtConfig } from '../config/jwt.config';
import { SettingsModule } from './settings.module';
import { EmailModule } from './email.module';
import { CaptchaModule } from './captcha.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: jwtConfig.signOptions,
    }),
    SettingsModule,
    EmailModule,
    CaptchaModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

