import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createEvent(
    userId: string,
    title: string,
    eventDate: Date,
    description?: string,
    exerciseType?: string,
  ): Promise<Event> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const event = this.eventRepository.create({
      title,
      eventDate,
      description,
      exerciseType,
      user,
      userId,
    });

    return this.eventRepository.save(event);
  }

  async getEventsByUserId(userId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { userId },
      order: { eventDate: 'ASC' },
    });
  }

  async getPastEventsByUserId(userId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { userId, status: 'past' },
      order: { eventDate: 'DESC' },
    });
  }

  async getFutureEventsByUserId(userId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { userId, status: 'future' },
      order: { eventDate: 'ASC' },
    });
  }

  async updateEventStatus(
    eventId: string,
    status: 'past' | 'future',
  ): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new Error('Event not found');
    }

    event.status = status;
    return this.eventRepository.save(event);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.eventRepository.delete(eventId);
  }
}