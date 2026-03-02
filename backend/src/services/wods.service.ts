import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWodDto, UpdateWodDto } from '../dtos/wods.dto';
import { generateSlug } from '../utils/slugify';

@Injectable()
export class WodsService {
  constructor(private prisma: PrismaService) {}

  async create(createWodDto: CreateWodDto) {
    const slug = createWodDto.slug || generateSlug(createWodDto.name);
    return this.prisma.wod.create({
      data: {
        ...createWodDto,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.wod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const wod = await this.prisma.wod.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });
    if (!wod) {
      throw new NotFoundException(`WOD with ID ${id} not found`);
    }
    return wod;
  }

  async update(id: string, updateWodDto: UpdateWodDto) {
    try {
      const dataToUpdate = { ...updateWodDto };
      if (updateWodDto.name && !updateWodDto.slug) {
        dataToUpdate.slug = generateSlug(updateWodDto.name);
      }
      return await this.prisma.wod.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch {
      throw new NotFoundException(`WOD with ID ${id} not found`);
    }
  }

  async updateRating(id: string, delta: number) {
    try {
      return await this.prisma.wod.update({
        where: { id },
        data: {
          rating: {
            increment: delta,
          },
        },
      });
    } catch {
      throw new NotFoundException(`WOD with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.wod.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`WOD with ID ${id} not found`);
    }
  }
}
