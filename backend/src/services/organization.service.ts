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

    const recentEventResults = await (this.prisma as any).eventResult.count({
        where: {
            dateAdded: { gte: thirtyDaysAgo },
            event: {
                userId: { in: athleteIds } // Approximation: user matches if they participated. 
                // Better approach: Find results where username matches athlete names? 
                // Schema shows EventResult has 'username' but not direct userId relation.
                // Let's use StrengthWorkoutResult which has userId.
            }
        }
    });

    const recentStrengthResults = await (this.prisma as any).strengthWorkoutResult.findMany({
        where: {
            userId: { in: athleteIds },
            date: { gte: thirtyDaysAgo }
        },
        select: { userId: true }
    });

    const activeAthleteIds = new Set(recentStrengthResults.map((r: any) => r.userId));
    // Since EventResult links by username, let's skip it for "Active Athlete" exact count for now to avoid name mismatch issues,
    // or try to match by name.
    // For simplicity, we count Strength Active Athletes.
    
    // 4. Recent Activity (Global for Trainer's teams)
    // Fetch latest Strength Results
    const latestActivity = await (this.prisma as any).strengthWorkoutResult.findMany({
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

    const formattedActivity = latestActivity.map((activity: any) => ({
        id: activity.id,
        athleteName: `${activity.user.name} ${activity.user.lastName || ''}`.trim(),
        action: `performed ${activity.exercise.name}`,
        date: activity.date,
        details: `${activity.weight}kg x ${activity.reps}`
    }));

    return {
        totalAthletes: uniqueAthletes.length,
        activeAthletes: activeAthleteIds.size,
        totalTeams: ownedTeams.length,
        totalWorkouts: recentStrengthResults.length, // + EventResults count if possible
        recentActivity: formattedActivity
    };
  }
}
