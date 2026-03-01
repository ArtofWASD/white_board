import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentExerciseDto, UpdateContentExerciseDto } from '../dtos/content-exercises.dto';
import { generateSlug } from '../utils/slugify';

@Injectable()
export class ContentExercisesService {
  constructor(private prisma: PrismaService) {}

  async createContentExercise(dto: CreateContentExerciseDto) {
    const slug = dto.slug || generateSlug(dto.name);
    return this.prisma.contentExercise.create({
      data: {
        ...dto,
        slug,
      },
    });
  }

  async getAllContentExercises() {
    return this.prisma.contentExercise.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getContentExerciseById(id: string) {
    const exercise = await this.prisma.contentExercise.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
    });

    if (!exercise) {
      throw new NotFoundException('Content exercise not found');
    }

    return exercise;
  }

  async updateContentExercise(id: string, dto: UpdateContentExerciseDto) {
    const exercise = await this.prisma.contentExercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Content exercise not found');
    }

    const dataToUpdate = { ...dto };
    if (dto.name && !dto.slug) {
      dataToUpdate.slug = generateSlug(dto.name);
    }

    return this.prisma.contentExercise.update({
      where: { id },
      data: dataToUpdate,
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
    } catch {
      throw new NotFoundException(`Content Exercise with ID ${id} not found`);
    }
  }
}
