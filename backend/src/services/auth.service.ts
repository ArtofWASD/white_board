import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  NotImplementedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from '../dtos/auth.dto';
import { SafeUser, UserResponse } from '../types';
import { EmailService } from './email.service';
import { CaptchaService } from './captcha.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private captchaService: CaptchaService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
    } else {
      // Митигация timing attack: выполняем хеширование фиктивного пароля
      // чтобы время ответа было примерно одинаковым
      await bcrypt.compare(password, '$2a$10$abcdefghijklmnopqrstuvwxyz012345');
    }

    return null;
  }

  async login(loginDto: LoginDto, ip: string = '') {
    // Проверяем капчу перед любой другой логикой
    await this.captchaService.validate(loginDto.captchaToken || '', ip);

    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверяем, подтверждён ли email
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Email не подтверждён. Проверьте почту и перейдите по ссылке для активации аккаунта.',
      );
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        height: user.height,
        weight: user.weight,
        dashboardLayout: user.dashboardLayout,
        dashboardLayoutMode: user.dashboardLayoutMode,
        avatarUrl: (user as any).avatarUrl,
      } as UserResponse,
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto, ipAddress: string = 'unknown') {
    // Проверяем капчу перед любой другой логикой
    await this.captchaService.validate(registerDto.captchaToken || '', ipAddress);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException(
        'Registration failed. Username or Email may be already taken.',
      );
    }

    // @ts-expect-error - Checking for role not in DTO type but potentially in payload
    if (registerDto.role === 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Registration as SUPER_ADMIN is not allowed',
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    let organizationData: {
      organization?: Prisma.OrganizationCreateNestedOneWithoutUsersInput;
    } = {};
    if (
      registerDto.organizationName &&
      registerDto.organizationName.trim().length > 0
    ) {
      organizationData = {
        organization: {
          create: {
            name: registerDto.organizationName,
          },
        },
      };
    }

    const isOrgRegistration = !!organizationData.organization;
    const computedUserType = isOrgRegistration
      ? 'organization'
      : registerDto.userType || 'individual';

    // Текущая версия документов (дата в формате YYYY-MM-DD)
    const currentVersion = new Date().toISOString().split('T')[0];

    // Генерируем токен верификации email (UUID, 24 часа TTL)
    const verificationToken = crypto.randomUUID();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24);

    await this.prisma.user.create({
      data: {
        name: registerDto.name,
        lastName: registerDto.lastName,
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role,
        gender: registerDto.gender,
        isAdmin:
          registerDto.role === 'TRAINER' ||
          registerDto.role === 'ORGANIZATION_ADMIN',
        userType: computedUserType,
        organizationName: registerDto.organizationName,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        termsVersion: currentVersion,
        privacyAccepted: true,
        privacyAcceptedAt: new Date(),
        privacyVersion: currentVersion,
        consentAccepted: true,
        consentAcceptedAt: new Date(),
        consentVersion: currentVersion,
        registrationIp: ipAddress,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
        ...organizationData,
      },
    });

    // Отправляем письмо — не блокируем регистрацию если email упал
    try {
      await this.emailService.sendVerificationEmail(
        registerDto.email,
        verificationToken,
      );
    } catch (err) {
      console.error('Failed to send verification email after register:', err);
    }

    return {
      message:
        'Регистрация успешна! Проверьте почту и перейдите по ссылке для активации аккаунта.',
    };
  }

  /**
   * Верификация email по токену.
   * При успехе выдаёт access + refresh токены, как при логине.
   */
  async verifyEmail(
    token: string,
  ): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
      include: { organization: true },
    });

    if (!user) {
      throw new BadRequestException('Ссылка для подтверждения недействительна.');
    }

    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      throw new BadRequestException(
        'Ссылка для подтверждения устарела. Запросите новую.',
      );
    }

    if (user.emailVerified) {
      // Уже подтверждён — просто выдаём токены
      const accessToken = this.jwtService.sign(
        { email: user.email, sub: user.id, role: user.role },
        { expiresIn: '15m' },
      );
      const refreshToken = await this.generateRefreshToken(user.id);
      return {
        user: this.buildUserResponse(user),
        accessToken,
        refreshToken,
      };
    }

    // Помечаем как подтверждённый, стираем токен
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: this.buildUserResponse({ ...user, organizationId: user.organizationId }),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Повторная отправка письма верификации
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Не раскрываем информацию о существовании пользователя
      return {
        message:
          'Если аккаунт с таким email существует, письмо было отправлено.',
      };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email уже подтверждён.');
    }

    const verificationToken = crypto.randomUUID();
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    await this.emailService.sendVerificationEmail(email, verificationToken);

    return {
      message: 'Если аккаунт с таким email существует, письмо было отправлено.',
    };
  }

  // ─── OAuth stubs ───────────────────────────────────────────────────────────

  /**
   * @stub Будущая интеграция с Яндекс OAuth 2.0.
   * Реализация: получить code от Яндекс → обменять на access_token →
   * получить профиль пользователя → найти/создать OAuthAccount + User →
   * выдать наши JWT-токены.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loginWithYandex(_yandexCode: string): Promise<never> {
    throw new NotImplementedException(
      'Авторизация через Яндекс ещё не реализована.',
    );
  }

  /**
   * @stub Будущая интеграция с Telegram Bot Auth / Login Widget.
   * Реализация: проверить подпись Telegram hash (HMAC-SHA256 через bot token) →
   * найти/создать OAuthAccount + User → выдать наши JWT-токены.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loginWithTelegram(_telegramData: Record<string, string>): Promise<never> {
    throw new NotImplementedException(
      'Авторизация через Telegram ещё не реализована.',
    );
  }

  // ─── Profile ───────────────────────────────────────────────────────────────

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (updateProfileDto.lastName !== undefined) {
      updateData.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.height !== undefined) {
      updateData.height = updateProfileDto.height;
    }
    if (updateProfileDto.weight !== undefined) {
      updateData.weight = updateProfileDto.weight;
    }
    if (updateProfileDto.dashboardLayout !== undefined) {
      updateData.dashboardLayout = updateProfileDto.dashboardLayout;
    }
    if (updateProfileDto.dashboardLayoutMode !== undefined) {
      updateData.dashboardLayoutMode = updateProfileDto.dashboardLayoutMode;
    }

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateProfileDto.email },
      });
      if (existingUser) {
        throw new UnauthorizedException('Email update failed.');
      }
      updateData.email = updateProfileDto.email;
    }

    if (updateProfileDto.password) {
      if (!updateProfileDto.currentPassword) {
        throw new UnauthorizedException(
          'Current password is required to set a new password',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        updateProfileDto.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid current password');
      }

      const hashedPassword = await bcrypt.hash(updateProfileDto.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { user: this.buildUserResponse(updatedUser) };
  }

  async lookupUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatarUrl: (user as any).avatarUrl,
    };
  }

  async getAthletes() {
    const users = await this.prisma.user.findMany({
      where: { role: UserRole.ATHLETE },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        role: true,
        teamMemberships: {
          select: {
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return users;
  }

  async getUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user: this.buildUserResponse(user) };
  }

  // ─── Token helpers ─────────────────────────────────────────────────────────

  async generateRefreshToken(userId: string): Promise<string> {
    const token = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > storedToken.expiresAt) {
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      const payload = {
        email: storedToken.user.email,
        sub: storedToken.user.id,
        role: storedToken.user.role,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

      return {
        accessToken,
        user: this.buildUserResponse(storedToken.user),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private buildUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      height: user.height,
      weight: user.weight,
      dashboardLayout: user.dashboardLayout,
      dashboardLayoutMode: user.dashboardLayoutMode,
      avatarUrl: user.avatarUrl,
      organizationId: user.organizationId,
    } as UserResponse;
  }
}
