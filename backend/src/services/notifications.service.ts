import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notification, Prisma } from '@prisma/client';

import { NotificationsGateway } from '../modules/notifications/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(
    userId: string,
    type: string,
    message: string,
    data: Prisma.InputJsonValue = {},
    title?: string,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        message,
        data,
        title,
      },
    });

    // Emit event to the user's room
    this.notificationsGateway.server
      .to(userId)
      .emit('newNotification', notification);

    return notification;
  }

  async getNotifications(
    userId: string,
    unreadOnly: boolean = false,
  ): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 notifications for now
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
