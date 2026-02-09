/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from '../dtos/auth.dto';
import { SafeUser, UserResponse, User } from '../types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUser | null> {
    const user = await (this.prisma as any).user.findUnique({
      where: { email },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
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
      } as UserResponse,
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto, ipAddress: string = 'unknown') {
    const existingUser = await (this.prisma as any).user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    let organizationData: any = {};
    // Проверяем, указано ли имя организации и не пустое ли оно
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

    const newUser = await (this.prisma as any).user.create({
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
        // Маппинг устаревших полей
        userType: computedUserType,
        organizationName: registerDto.organizationName,
        // Согласия на обработку персональных данных (152-ФЗ)
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
        ...organizationData,
      },
      include: {
        organization: true,
      },
    });

    const payload = {
      email: newUser.email,
      sub: newUser.id,
      role: newUser.role,
      organizationId: newUser.organization?.id,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.generateRefreshToken(newUser.id);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        height: newUser.height,
        weight: newUser.weight,
        dashboardLayout: newUser.dashboardLayout,
        dashboardLayoutMode: newUser.dashboardLayoutMode,
        organizationId: newUser.organization?.id,
      } as UserResponse,
      accessToken,
      refreshToken,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Log the incoming data

    // Создаем объект обновления только с предоставленными полями
    const updateData: Partial<User> = {};
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

    // Обработка обновления Email
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await (this.prisma as any).user.findUnique({
        where: { email: updateProfileDto.email },
      });
      if (existingUser) {
        throw new UnauthorizedException('Email already in use');
      }
      updateData.email = updateProfileDto.email;
    }

    // Обработка обновления пароля
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

    // Обновляем пользователя новыми данными
    const updatedUser = await (this.prisma as any).user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        height: updatedUser.height,
        weight: updatedUser.weight,
        dashboardLayout: updatedUser.dashboardLayout,
        dashboardLayoutMode: updatedUser.dashboardLayoutMode,
      } as UserResponse,
    };
  }

  async lookupUserByEmail(email: string) {
    const user = await (this.prisma as any).user.findUnique({
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
    };
  }

  async getAthletes() {
    try {
      const users = await (this.prisma as any).user.findMany({
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
    } catch (error) {
      // Логируем ошибку внутри, если нужно, или просто пробрасываем

      throw error;
    }
  }
  async getUser(userId: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

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
        organizationId: user.organizationId,
      } as UserResponse,
    };
  }

  /**
   * Генерация refresh токена
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const token = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    await (this.prisma as any).refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Валидация и обновление токенов через refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Проверяем, существует ли токен в базе
      const storedToken = await (this.prisma as any).refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Проверяем, не истек ли токен
      if (new Date() > storedToken.expiresAt) {
        // Удаляем истекший токен
        await (this.prisma as any).refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Генерируем новый access token
      const payload = {
        email: storedToken.user.email,
        sub: storedToken.user.id,
        role: storedToken.user.role,
      };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

      return {
        accessToken,
        user: {
          id: storedToken.user.id,
          name: storedToken.user.name,
          lastName: storedToken.user.lastName,
          email: storedToken.user.email,
          role: storedToken.user.role,
          height: storedToken.user.height,
          weight: storedToken.user.weight,
          dashboardLayout: storedToken.user.dashboardLayout,
          dashboardLayoutMode: storedToken.user.dashboardLayoutMode,
          organizationId: storedToken.user.organizationId,
        } as UserResponse,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Удаление refresh токена (logout)
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await (this.prisma as any).refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Удаление всех refresh токенов пользователя
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await (this.prisma as any).refreshToken.deleteMany({
      where: { userId },
    });
  }
}
