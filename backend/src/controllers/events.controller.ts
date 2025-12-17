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
  ForbiddenException,
  Request,
  Query,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import {
  CreateEventDto,
  UpdateEventStatusDto,
  CreateEventResultDto,
} from '../dtos/events.dto';

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
        createEventDto.exercises, // Add exercises parameter
        createEventDto.participantIds,
        createEventDto.timeCap,
        createEventDto.rounds,
        createEventDto.teamId,
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
  async getEventsByUserId(
    @Param('userId') userId: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.eventsService.getEventsByUserId(userId, teamId);
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


    const userId = body.userId;
    if (!userId) {

      throw new BadRequestException('User ID is required');
    }


    await this.eventsService.deleteEvent(eventId, userId);
  }

  @Post(':eventId/results')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  async createEventResult(
    @Param('eventId') eventId: string,
    @Body() createEventResultDto: CreateEventResultDto,
  ) {
    try {
      return await this.eventsService.createEventResult(
        eventId,
        createEventResultDto.time,
        createEventResultDto.username,
      );
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException as-is
      }
      // For any other errors, throw a generic bad request exception
      throw new BadRequestException('Ошибка при добавлении результата события');
    }
  }

  @Get(':eventId/results')
  async getEventResults(@Param('eventId') eventId: string) {
    return this.eventsService.getEventResults(eventId);
  }

  @Put(':eventId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() updateEventDto: CreateEventDto,
  ) {
    try {
      return await this.eventsService.updateEvent(
        eventId,
        updateEventDto.userId,
        updateEventDto.title,
        updateEventDto.eventDate,
        updateEventDto.description,
        updateEventDto.exerciseType,
        updateEventDto.exercises, // Add exercises parameter
        updateEventDto.timeCap,
        updateEventDto.rounds,
        updateEventDto.teamId,
      );
    } catch (error: unknown) {
      // Handle specific errors
      if (error instanceof Error && error.message === 'Invalid date format') {
        throw new BadRequestException('Неверный формат даты');
      }
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException as-is
      }
      if (error instanceof ForbiddenException) {
        throw error; // Re-throw ForbiddenException as-is
      }
      // For any other errors, throw a generic bad request exception
      throw new BadRequestException('Ошибка при обновлении события');
    }
  }
}
