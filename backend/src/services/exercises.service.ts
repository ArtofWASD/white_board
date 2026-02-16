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

  async getExercisesByUserId(userId: string) {
    const exercises = await this.prisma.userExercise.findMany({
      where: {
        userId,
      },
      include: {
        records: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return exercises.map((exercise) => {
      const maxWeight = exercise.records.reduce((max, record) => {
        return record.weight > max ? record.weight : max;
      }, 0);

      return {
        ...exercise,
        maxWeight,
      };
    });
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
