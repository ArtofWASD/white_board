import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWodDto, UpdateWodDto } from '../dtos/wods.dto';

@Injectable()
export class WodsService {
  constructor(private prisma: PrismaService) {}

  async create(createWodDto: CreateWodDto) {
    return this.prisma.wod.create({
      data: createWodDto,
    });
  }

  async findAll() {
    return this.prisma.wod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const wod = await this.prisma.wod.findUnique({
      where: { id },
    });
    if (!wod) {
      throw new NotFoundException(`WOD with ID ${id} not found`);
    }
    return wod;
  }

  async update(id: string, updateWodDto: UpdateWodDto) {
    try {
        return await this.prisma.wod.update({
            where: { id },
            data: updateWodDto,
        });
    } catch (error) {
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
    } catch (error) {
      throw new NotFoundException(`WOD with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
        return await this.prisma.wod.delete({
            where: { id },
        });
    } catch (error) {
        throw new NotFoundException(`WOD with ID ${id} not found`);
    }
  }
}
