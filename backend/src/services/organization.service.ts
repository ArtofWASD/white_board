import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getTrainerStats(trainerId: string) {
    // 1. Получаем все команды, которыми владеет тренер
    const ownedTeams = await (this.prisma as any).team.findMany({
      where: { ownerId: trainerId },
      include: {
        members: {
            include: {
                user: true
            }
        }
      }
    });

    // 2. Извлекаем уникальных атлетов
    const allMembers = ownedTeams.flatMap((team: any) => team.members.map((m: any) => m.user));
    const uniqueAthletes = Array.from(new Set(allMembers.map((u: any) => u.id)))
        .map(id => allMembers.find((u: any) => u.id === id));
    
    // 3. Считаем активных атлетов (у которых есть результаты за последние 30 дней)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const athleteIds = uniqueAthletes.map((u: any) => u.id);

    // Получаем отдельные счетчики/ID для их объединения
    const recentStrengthResults = await (this.prisma as any).strengthWorkoutResult.findMany({
        where: {
            userId: { in: athleteIds },
            date: { gte: thirtyDaysAgo }
        },
        select: { userId: true }
    });

    // Полученные активные атлеты и тренировки
    // Примечание: старые EventResults могут не иметь userId, только username.
    const athleteNames = uniqueAthletes.map((u: any) => `${u.name} ${u.lastName || ''}`.trim());
    const athleteNamesSimple = uniqueAthletes.map((u: any) => u.name); // Fallback if lastname missing in DB but present in Result

    const recentEventResults = await (this.prisma as any).eventResult.findMany({
        where: {
             OR: [
                { userId: { in: athleteIds } },
                 // Помощник: Ищем по имени пользователя, если userId равен null
                 // Используем простое сопоставление имен
                { username: { in: [...athleteNames, ...athleteNamesSimple] } },
                { event: { userId: { in: athleteIds } } } // Если атлет создал событие (например, личное)
             ],
            dateAdded: { gte: thirtyDaysAgo }
        },
        include: {
            user: true,
            event: true
        }
    });

    const activeAthleteIds = new Set<string>();
    recentStrengthResults.forEach((r: any) => activeAthleteIds.add(r.userId));
    recentEventResults.forEach((r: any) => {
        if (r.userId) {
            activeAthleteIds.add(r.userId);
        } else {
             // Пытаемся сопоставить имя пользователя обратно с athleteId
             const athlete = uniqueAthletes.find((u: any) => 
                `${u.name} ${u.lastName || ''}`.trim() === r.username || 
                u.name === r.username
             );
             if (athlete) activeAthleteIds.add(athlete.id);
        }
    });
    
    // 4. Недавняя активность (Глобальная для команд тренера)
    // Получаем последние силовые результаты
    const latestStrengthActivity = await (this.prisma as any).strengthWorkoutResult.findMany({
        where: {
            userId: { in: athleteIds }
        },
        take: 5,
        orderBy: { date: 'desc' },
        include: {
            user: { select: { name: true, lastName: true } },
            exercise: { select: { name: true } }
        }
    });

    // Получаем последние результаты событий
    const latestEventActivity = await (this.prisma as any).eventResult.findMany({
        where: {
             OR: [
                { userId: { in: athleteIds } },
                { username: { in: [...athleteNames, ...athleteNamesSimple] } },
                { event: { userId: { in: athleteIds } } }
             ]
        },
        take: 5,
        orderBy: { dateAdded: 'desc' },
        include: {
            user: { select: { name: true, lastName: true } },
            event: { select: { title: true } }
        }
    });

    const formattedStrengthActivity = latestStrengthActivity.map((activity: any) => ({
        id: activity.id,
        athleteName: `${activity.user.name} ${activity.user.lastName || ''}`.trim(),
        action: `выполнил упражнение ${activity.exercise.name}`,
        date: activity.date,
        details: `${activity.weight}кг x ${activity.reps}`
    }));

    const formattedEventActivity = latestEventActivity.map((activity: any) => {
        const name = activity.user 
            ? `${activity.user.name} ${activity.user.lastName || ''}`.trim()
            : activity.username || 'Unknown Athlete';
            
        return {
            id: activity.id,
            athleteName: name,
            action: `завершил событие ${activity.event.title}`,
            date: activity.dateAdded,
            details: `Результат: ${activity.time}`
        };
    });

    // Объединяем и сортируем
    const allActivity = [...formattedStrengthActivity, ...formattedEventActivity]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return {
        totalAthletes: uniqueAthletes.length,
        activeAthletes: activeAthleteIds.size,
        totalTeams: ownedTeams.length,
        totalWorkouts: recentStrengthResults.length + recentEventResults.length,
        recentActivity: allActivity
    };
  }
  async getAllForAdmin() {
    const orgs = await (this.prisma as any).organization.findMany({
      include: {
        _count: {
          select: { users: true, teams: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return orgs.map((org: any) => ({
      id: org.id,
      name: org.name,
      createdAt: org.createdAt,
      isBlocked: org.isBlocked,
      userCount: org._count.users,
      teamCount: org._count.teams
    }));
  }

  async toggleBlockStatus(id: string, isBlocked: boolean) {
    return (this.prisma as any).organization.update({
      where: { id },
      data: { isBlocked }
    });
  }
}
