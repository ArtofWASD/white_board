import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StrengthResultsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    exerciseId: string;
    date: Date;
    week: number;
    weight: number;
    reps: number;
  }) {
    return this.prisma.strengthWorkoutResult.create({
      data,
    });
  }

  async findByUser(userId: string) {
    return this.prisma.strengthWorkoutResult.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { exercise: true },
    });
  }

  async findByUserAndExercise(userId: string, exerciseId: string) {
    return this.prisma.strengthWorkoutResult.findMany({
      where: { userId, exerciseId },
      orderBy: { date: 'desc' },
    });
  }
}
