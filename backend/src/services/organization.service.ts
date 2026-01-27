import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getTrainerStats(trainerId: string) {
    // 1. Get all teams owned by the trainer
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

    // 2. Extract unique athletes
    const allMembers = ownedTeams.flatMap((team: any) => team.members.map((m: any) => m.user));
    const uniqueAthletes = Array.from(new Set(allMembers.map((u: any) => u.id)))
        .map(id => allMembers.find((u: any) => u.id === id));
    
    // 3. Count Active Athletes (those with results in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const athleteIds = uniqueAthletes.map((u: any) => u.id);

    // Fetch separate counts/IDs to merge them
    const recentStrengthResults = await (this.prisma as any).strengthWorkoutResult.findMany({
        where: {
            userId: { in: athleteIds },
            date: { gte: thirtyDaysAgo }
        },
        select: { userId: true }
    });

    // Fetched Active Athletes and Workouts
    // Note: older EventResults might not have userId, only username.
    const athleteNames = uniqueAthletes.map((u: any) => `${u.name} ${u.lastName || ''}`.trim());
    const athleteNamesSimple = uniqueAthletes.map((u: any) => u.name); // Fallback if lastname missing in DB but present in Result

    const recentEventResults = await (this.prisma as any).eventResult.findMany({
        where: {
             OR: [
                { userId: { in: athleteIds } },
                 // Helper: Match by username if userId is null
                 // Use basic name matching
                { username: { in: [...athleteNames, ...athleteNamesSimple] } },
                { event: { userId: { in: athleteIds } } } // If athlete created event (e.g. personal)
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
             // Try to map username back to athleteId
             const athlete = uniqueAthletes.find((u: any) => 
                `${u.name} ${u.lastName || ''}`.trim() === r.username || 
                u.name === r.username
             );
             if (athlete) activeAthleteIds.add(athlete.id);
        }
    });
    
    // 4. Recent Activity (Global for Trainer's teams)
    // Fetch latest Strength Results
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

    // Fetch latest Event Results
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

    // Merge and sort
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
