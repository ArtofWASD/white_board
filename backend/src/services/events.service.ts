import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(
    userId: string,
    title: string,
    eventDate: Date,
    description?: string,
    exerciseType?: string,
  ) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const event = await this.prisma.event.create({
      data: {
        title,
        eventDate,
        description,
        exerciseType,
        userId,
      },
    });

    return event;
  }

  async getEventsByUserId(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
      orderBy: { eventDate: 'asc' },
    });
  }

  async getPastEventsByUserId(userId: string) {
    // First update event statuses based on current date
    await this.updateEventStatuses();

    return this.prisma.event.findMany({
      where: {
        userId,
        status: 'past',
      },
      orderBy: { eventDate: 'desc' },
    });
  }

  async getFutureEventsByUserId(userId: string) {
    // First update event statuses based on current date
    await this.updateEventStatuses();

    return this.prisma.event.findMany({
      where: {
        userId,
        status: 'future',
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async updateEventStatus(eventId: string, status: 'past' | 'future') {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: { status },
    });
  }

  async updateEventStatuses(): Promise<void> {
    const now = new Date();

    // Update past events
    await this.prisma.event.updateMany({
      where: {
        eventDate: {
          lt: now,
        },
        status: 'future',
      },
      data: {
        status: 'past',
      },
    });

    // Update future events
    await this.prisma.event.updateMany({
      where: {
        eventDate: {
          gte: now,
        },
        status: 'past',
      },
      data: {
        status: 'future',
      },
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({
      where: { id: eventId },
    });
  }
}
