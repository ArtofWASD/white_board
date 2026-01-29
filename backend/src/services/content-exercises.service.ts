import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentExercisesService {
  constructor(private prisma: PrismaService) {}

  async createContentExercise(name: string, description?: string, videoUrl?: string) {
    return this.prisma.contentExercise.create({
      data: {
        name,
        description,
        videoUrl,
      },
    });
  }

  async getAllContentExercises() {
    return this.prisma.contentExercise.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async updateContentExercise(id: string, data: { name?: string; description?: string; videoUrl?: string }) {
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
}
