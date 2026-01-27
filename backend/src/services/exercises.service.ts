import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async createExercise(userId: string, name: string, initialWeight?: number) {
    const exercise = await this.prisma.exercise.create({
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

  async createGlobalExercise(name: string, description?: string, videoUrl?: string) {
    return this.prisma.exercise.create({
        data: {
            name,
            description,
            videoUrl,
            userId: null // Global
        }
    });
  }

  async getGlobalExercises() {
      return this.prisma.exercise.findMany({
          where: { userId: null },
          orderBy: { name: 'asc' }
      });
  }

  async getExercisesByUserId(userId: string) {
    const exercises = await this.prisma.exercise.findMany({
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
    const exercise = await this.prisma.exercise.findUnique({
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
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return this.prisma.exercise.update({
        where: { id },
        data: { name },
    });
  }

  async updateExerciseDetails(id: string, data: { name?: string, description?: string, videoUrl?: string }) {
      return this.prisma.exercise.update({
          where: { id },
          data
      });
  }

  async deleteExercise(id: string) {
      return this.prisma.exercise.delete({
          where: { id }
      });
  }
}
