/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(
    userId: string,
    title: string,
    eventDate: string,
    description?: string,
    exerciseType?: string,
    participantIds?: string[],
  ) {
    console.log('Creating event with data:', {
      userId,
      title,
      eventDate,
      description,
      exerciseType,
      participantIds,
    });

    // Check if user exists
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      console.log('User not found:', userId);
      throw new NotFoundException('User not found');
    }

    // Validate participants if provided
    if (participantIds && participantIds.length > 0) {
      const participants = await (this.prisma as any).user.findMany({
        where: { id: { in: participantIds } },
      });

      if (participants.length !== participantIds.length) {
        console.log('Some participants not found:', participantIds);
        throw new NotFoundException('One or more participants not found');
      }
    }

    // Convert string date to Date object and validate
    const eventDateObj = new Date(eventDate);
    if (isNaN(eventDateObj.getTime())) {
      console.log('Invalid date format:', eventDate);
      throw new Error('Invalid date format');
    }

    console.log('Converted date object:', eventDateObj);

    // Prepare event data
    const baseEventData = {
      title,
      eventDate: eventDateObj,
      description,
      exerciseType,
      userId,
    };

    // Add participants if provided
    const createData =
      participantIds && participantIds.length > 0
        ? {
            ...baseEventData,
            participants: {
              connect: participantIds.map((id) => ({ id })),
            },
          }
        : baseEventData;

    console.log('Creating event with data:', createData);
    const event = await (this.prisma as any).event.create({
      data: createData,
    });
    console.log('Event created successfully:', event);

    return event;
  }

  async getEventsByUserId(userId: string) {
    return (this.prisma as any).event.findMany({
      where: { userId },
      orderBy: { eventDate: 'asc' },
    });
  }

  async getPastEventsByUserId(userId: string) {
    // First update event statuses based on current date
    await this.updateEventStatuses();

    return (this.prisma as any).event.findMany({
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

    return (this.prisma as any).event.findMany({
      where: {
        userId,
        status: 'future',
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async updateEventStatus(eventId: string, status: 'past' | 'future') {
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return (this.prisma as any).event.update({
      where: { id: eventId },
      data: { status },
    });
  }

  async updateEventStatuses(): Promise<void> {
    const now = new Date();

    // Update past events
    await (this.prisma as any).event.updateMany({
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
    await (this.prisma as any).event.updateMany({
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

  async deleteEvent(eventId: string, userId: string): Promise<void> {
    console.log('Attempting to delete event:', { eventId, userId });

    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      console.log('Event not found:', eventId);
      throw new NotFoundException('Event not found');
    }

    console.log('Found event:', event);

    // Check if the user is the owner of the event
    if (event.userId !== userId) {
      console.log('User is not the owner of the event:', {
        userId,
        eventUserId: event.userId,
      });
      throw new ForbiddenException('You can only delete your own events');
    }

    console.log('Deleting event:', eventId);
    await (this.prisma as any).event.delete({
      where: { id: eventId },
    });
    console.log('Event deleted successfully:', eventId);
  }

  async createEventResult(eventId: string, time: string, username: string) {
    // Check if event exists
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Create event result
    const eventResult = await (this.prisma as any).eventResult.create({
      data: {
        time,
        username,
        eventId,
      },
    });

    return eventResult;
  }

  async getEventResults(eventId: string) {
    // Check if event exists
    const event = await (this.prisma as any).event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Get all results for the event
    return (this.prisma as any).eventResult.findMany({
      where: { eventId: eventId },
      orderBy: { dateAdded: 'desc' },
    });
  }
}
