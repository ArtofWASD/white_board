import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Param,
  Get,
  Query,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from '../dtos/auth.dto';

import { SettingsService } from '../services/settings.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() body: any, @Req() request: any) {
    // Проверяем флаги функций
    const settings = await this.settingsService.getAll();
    const settingsMap = settings.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    if (settingsMap['MAINTENANCE_MODE'] === 'true') {
      throw new ForbiddenException(
        'Registration is currently disabled due to maintenance.',
      );
    }

    const { role, userType } = body;

    if (role === 'ATHLETE' && settingsMap['REGISTRATION_ATHLETE'] === 'false') {
      throw new ForbiddenException(
        'Athlete registration is currently disabled.',
      );
    }

    if (role === 'TRAINER' && settingsMap['REGISTRATION_TRAINER'] === 'false') {
      throw new ForbiddenException(
        'Trainer registration is currently disabled.',
      );
    }

    if (
      userType === 'organization' &&
      settingsMap['REGISTRATION_ORGANIZATION'] === 'false'
    ) {
      throw new ForbiddenException(
        'Organization registration is currently disabled.',
      );
    }

    // Получаем IP-адрес из запроса
    const ipAddress =
      request.ip || request.connection?.remoteAddress || 'unknown';

    try {
      return await this.authService.register(body, ipAddress);
    } catch (error) {
      console.error('Registration Error:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      return {
        status: 'error',
        message: error.message,
        stack: error.stack,
        details: error,
      };
    }
  }

  @HttpCode(HttpStatus.OK)
  @Put('profile/:userId')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('lookup')
  async lookupUser(@Query('email') email: string) {
    try {
      return await this.authService.lookupUserByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('athletes')
  async getAthletes() {
    return this.authService.getAthletes();
  }
  @HttpCode(HttpStatus.OK)
  // Получаем данные пользователя для верификации
  @Get('user/:userId')
  async getUser(@Param('userId') userId: string) {
    return this.authService.getUser(userId);
  }
}
