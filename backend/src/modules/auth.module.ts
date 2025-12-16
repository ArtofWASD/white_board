import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { jwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    PrismaModule,
    PrismaModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: jwtConfig.signOptions,
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
