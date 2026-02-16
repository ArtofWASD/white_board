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
  Res,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from '../dtos/auth.dto';

import { SettingsService } from '../services/settings.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Устанавливаем httpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 минут
    });

    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    // Возвращаем только данные пользователя (без токенов)
    return { user: result.user };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
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
    const ipAddress = request.ip || request.socket?.remoteAddress || 'unknown';

    try {
      const result = await this.authService.register(body, ipAddress);

      // Устанавливаем httpOnly cookies
      const isProduction = process.env.NODE_ENV === 'production';

      response.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      response.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { user: result.user };
    } catch (error: unknown) {
      console.error('Registration Error:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      const err = error as Error;
      return {
        status: 'error',
        message: err.message || 'Unknown error',
        stack: err.stack,
        details: err,
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
  @UseGuards(JwtAuthGuard)
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

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = (request.cookies as Record<string, string>)
      ?.refresh_token;

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    // Очищаем cookies
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = (request.cookies as Record<string, string>)
      ?.refresh_token;

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token not found');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // Обновляем access token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return { user: result.user };
  }
}
