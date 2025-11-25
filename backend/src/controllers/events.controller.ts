import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { CreateEventDto, UpdateEventStatusDto } from '../dtos/events.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  async createEvent(@Body() createEventDto: CreateEventDto) {
    try {
      return await this.eventsService.createEvent(
        createEventDto.userId,
        createEventDto.title,
        createEventDto.eventDate,
        createEventDto.description,
        createEventDto.exerciseType,
        createEventDto.participantIds,
      );
    } catch (error: unknown) {
      // Handle specific errors
      if (error instanceof Error && error.message === 'Invalid date format') {
        throw new BadRequestException('Неверный формат даты');
      }
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException as-is
      }
      // For any other errors, throw a generic bad request exception
      throw new BadRequestException('Ошибка при создании события');
    }
  }

  @Get(':userId')
  async getEventsByUserId(@Param('userId') userId: string) {
    return this.eventsService.getEventsByUserId(userId);
  }

  @Get(':userId/past')
  async getPastEventsByUserId(@Param('userId') userId: string) {
    return this.eventsService.getPastEventsByUserId(userId);
  }

  @Get(':userId/future')
  async getFutureEventsByUserId(@Param('userId') userId: string) {
    return this.eventsService.getFutureEventsByUserId(userId);
  }

  @Put(':eventId/status')
  @UsePipes(new ValidationPipe())
  async updateEventStatus(
    @Param('eventId') eventId: string,
    @Body() updateEventStatusDto: UpdateEventStatusDto,
  ) {
    return this.eventsService.updateEventStatus(
      eventId,
      updateEventStatusDto.status,
    );
  }

  @Delete(':eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(
    @Param('eventId') eventId: string,
    @Body() body: { userId?: string },
  ) {
    console.log('Delete event request received:', { eventId, body });

    const userId = body.userId;
    if (!userId) {
      console.log('User ID is missing from request body');
      throw new BadRequestException('User ID is required');
    }

    console.log('Calling events service to delete event:', { eventId, userId });
    await this.eventsService.deleteEvent(eventId, userId);
  }
}
