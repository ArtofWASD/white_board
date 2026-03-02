import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { S3Service } from './s3.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        organizationId: true,
      },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, isBlocked: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked },
      select: {
        id: true,
        isBlocked: true,
      },
    });
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        role: true,
      },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Optional: Delete old avatar from S3 if it exists and is an S3 URL
    if (
      user.avatarUrl &&
      user.avatarUrl.includes(process.env.AWS_ENDPOINT || 'storage')
    ) {
      await this.s3Service.deleteFileByUrl(user.avatarUrl).catch(() => {
        // Ignore delete errors to not break upload
      });
    }

    const avatarUrl = await this.s3Service.uploadFile(file, 'avatars');

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });
  }
}
