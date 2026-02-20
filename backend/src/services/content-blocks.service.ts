import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentBlockDto, UpdateContentBlockDto } from '../dtos/content-blocks.dto';
import { ContentLocation } from '@prisma/client';

@Injectable()
export class ContentBlocksService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateContentBlockDto) {
    return this.prisma.contentBlock.create({
      data: createDto,
    });
  }

  async findAll() {
    return this.prisma.contentBlock.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findActiveByLocation(location: ContentLocation) {
    return this.prisma.contentBlock.findMany({
      where: {
        location,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const block = await this.prisma.contentBlock.findUnique({
      where: { id },
    });
    if (!block) {
      throw new NotFoundException(`ContentBlock with ID ${id} not found`);
    }
    return block;
  }

  async update(id: string, updateDto: UpdateContentBlockDto) {
    try {
      return await this.prisma.contentBlock.update({
        where: { id },
        data: updateDto,
      });
    } catch {
      throw new NotFoundException(`ContentBlock with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.contentBlock.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException(`ContentBlock with ID ${id} not found`);
    }
  }
}
