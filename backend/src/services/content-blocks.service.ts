import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentBlockDto, UpdateContentBlockDto } from '../dtos/content-blocks.dto';
import { ContentLocation, ContentBlock } from '@prisma/client';
import { generateSlug } from '../utils/slugify';

@Injectable()
export class ContentBlocksService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateContentBlockDto) {
    const slug = createDto.slug || generateSlug(createDto.title);
    
    // Ensure slug is unique by appending a random string if it exists
    let uniqueSlug = slug;
    let counter = 1;
    while (await this.findBySlug(uniqueSlug).catch(() => null)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return this.prisma.contentBlock.create({
      data: {
        ...createDto,
        slug: uniqueSlug,
      },
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

  async findBySlug(slug: string) {
    const block = await this.prisma.contentBlock.findUnique({
      where: { slug },
    });
    if (!block) {
      throw new NotFoundException(`ContentBlock with slug ${slug} not found`);
    }
    return block;
  }

  async update(id: string, updateDto: UpdateContentBlockDto) {
    try {
      const dataToUpdate = { ...updateDto };
      if (updateDto.title && !updateDto.slug) {
        // Optionally update slug if title changes, but normally slug shouldn't change
        // To be safe, let's keep it unmodified unless explicitly provided
      }
      
      if (updateDto.slug) {
         let uniqueSlug = updateDto.slug;
         let counter = 1;
         let existing = await this.findBySlug(uniqueSlug).catch(() => null);
         while (existing && existing.id !== id) {
           uniqueSlug = `${updateDto.slug}-${counter}`;
           counter++;
           existing = await this.findBySlug(uniqueSlug).catch(() => null);
         }
         dataToUpdate.slug = uniqueSlug;
      }

      return await this.prisma.contentBlock.update({
        where: { id },
        data: dataToUpdate,
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
