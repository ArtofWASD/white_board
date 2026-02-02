import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentExercisesService {
  constructor(private prisma: PrismaService) {}

  async createContentExercise(name: string, description?: string, videoUrl?: string, muscleGroups?: string[]) {
    return this.prisma.contentExercise.create({
      data: {
        name,
        description,
        videoUrl,
        muscleGroups,
      },
    });
  }

  async getAllContentExercises() {
    return this.prisma.contentExercise.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getContentExerciseById(id: string) {
    const exercise = await this.prisma.contentExercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Content exercise not found');
    }

    return exercise;
  }

  async updateContentExercise(id: string, data: { name?: string; description?: string; videoUrl?: string; muscleGroups?: string[] }) {
    const exercise = await this.prisma.contentExercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Content exercise not found');
    }

    return this.prisma.contentExercise.update({
      where: { id },
      data,
    });
  }

  async deleteContentExercise(id: string) {
    const exercise = await this.prisma.contentExercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Content exercise not found');
    }

    return this.prisma.contentExercise.delete({
      where: { id },
    });
  }

  async updateRating(id: string, delta: number) {
    try {
      return await this.prisma.contentExercise.update({
        where: { id },
        data: {
          rating: {
            increment: delta,
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`Content Exercise with ID ${id} not found`);
    }
  }
}
