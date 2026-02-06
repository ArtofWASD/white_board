import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalOrganizations, totalEvents] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.event.count(),
    ]);

    // Активные пользователи за последние 30 дней на основе создания событий или результатов (эвристика)
    // Находим пользователей, которые создали событие или результат за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // activeUserCount запрос
    const activeUserCount = await this.prisma.user.count({
        where: {
            OR: [
                { events: { some: { createdAt: { gte: thirtyDaysAgo } } } },
                { eventResults: { some: { dateAdded: { gte: thirtyDaysAgo } } } },
                { strengthResults: { some: { date: { gte: thirtyDaysAgo } } } }
            ]
        }
    });

    return {
      totalUsers,
      totalOrganizations,
      totalEvents,
      activeUsersLast30Days: activeUserCount
    };
  }

  async getRegistrationHistory() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Нам нужно агрегировать по дням вручную, так как groupBy в prisma не поддерживает усечение дат напрямую и просто во всех диалектах через API без сырых запросов.
    // Однако, для простоты и переносимости кода, мы получаем валидных пользователей и агрегируем в JS или используем сырой запрос.
    // Давайте используем сырой запрос для производительности, если возможно, или простую JS агрегацию, если набор данных небольшой.
    // Учитывая ограничения и для безопасности, давайте получим только даты создания.
    
    const newUsers = await this.prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
    });

    const map = new Map<string, number>();
    // Заполняем последние 30 дней нулями
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        map.set(d.toISOString().split('T')[0], 0);
    }

    newUsers.forEach(u => {
        const date = u.createdAt.toISOString().split('T')[0];
        // Считаем только если в пределах нашего диапазона карты (должно быть так из-за запроса)
        if (map.has(date)) {
            map.set(date, (map.get(date) || 0) + 1);
        }
    });

    const result = Array.from(map.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }

  async getRoleDistribution() {
    const data = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    return data.map(item => ({
      name: item.role,
      value: item._count.role
    }));
  }
}
