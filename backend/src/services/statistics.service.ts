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

    // Active users last 30 days based on event creation or results (heuristic)
    // Finding users who have created an event or result in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // activeUserCount query
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

    // We need to aggregate by day manually because prisma groupBy doesn't support date truncation directly easily in all dialects uniformly via the API without raw query.
    // However, for simplicity and portable code, we fetch valid users and aggregate in JS or use raw query.
    // Let's use raw query for performance if possible, or simple JS aggregation if data set is small.
    // Given the constraints and to stay safe, let's fetch created_at dates only.
    
    const newUsers = await this.prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
    });

    const map = new Map<string, number>();
    // Fill last 30 days with 0
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        map.set(d.toISOString().split('T')[0], 0);
    }

    newUsers.forEach(u => {
        const date = u.createdAt.toISOString().split('T')[0];
        // Only count if within our map range (it should be due to query)
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
