import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async createExercise(userId: string, name: string, initialWeight?: number) {
    const exercise = await this.prisma.userExercise.create({
      data: {
        name,
        userId,
      },
    });

    if (initialWeight !== undefined && initialWeight !== null) {
      await this.prisma.exerciseRecord.create({
        data: {
          weight: initialWeight,
          date: new Date(),
          exerciseId: exercise.id,
        },
      });
    }

    return exercise;
  }

  async getExercisesByUserId(userId: string, page?: number, limit?: number) {
    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit ? limit + 1 : undefined;

    const query: any = {
      where: { userId },
      include: {
        records: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    };

    if (skip !== undefined) query.skip = skip;
    if (take !== undefined) query.take = take;

    const rawExercises = await this.prisma.userExercise.findMany(query);

    let hasMore = false;
    let exercisesToReturn = rawExercises;

    if (page !== undefined && limit !== undefined) {
      hasMore = rawExercises.length > limit;
      exercisesToReturn = hasMore ? rawExercises.slice(0, limit) : rawExercises;
    }

    const mapped = (exercisesToReturn as any[]).map((exercise) => {
      const maxWeight = exercise.records.reduce((max: number, record: any) => {
        return record.weight > max ? record.weight : max;
      }, 0);

      return {
        ...exercise,
        maxWeight,
      };
    });

    if (page !== undefined && limit !== undefined) {
      return { data: mapped, meta: { hasMore } };
    }
    return mapped;
  }

  async addExerciseRecord(exerciseId: string, weight: number, date?: Date) {
    const exercise = await this.prisma.userExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return this.prisma.exerciseRecord.create({
      data: {
        weight,
        date: date || new Date(),
        exerciseId,
      },
    });
  }

  async getExerciseRecords(exerciseId: string) {
    return this.prisma.exerciseRecord.findMany({
      where: { exerciseId },
      orderBy: { date: 'desc' },
    });
  }
  async updateExercise(id: string, name: string) {
    const exercise = await this.prisma.userExercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return this.prisma.userExercise.update({
      where: { id },
      data: { name },
    });
  }

  async deleteExercise(id: string) {
    return this.prisma.userExercise.delete({
      where: { id },
    });
  }
}
