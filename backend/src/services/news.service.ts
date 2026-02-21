import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  async getAll(limit?: number) {
    return this.prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit ? Number(limit) : undefined,
    });
  }

  async getOne(id: string) {
    return this.prisma.news.findUnique({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    content: string;
    excerpt?: string;
    imageUrl?: string;
    createdAt?: string;
  }) {
    return this.prisma.news.create({
      data: {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      imageUrl?: string;
      createdAt?: string;
    },
  ) {
    return this.prisma.news.update({
      where: { id },
      data: {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.news.delete({
      where: { id },
    });
  }
}
