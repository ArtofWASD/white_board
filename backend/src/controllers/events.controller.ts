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
    return this.eventsService.createEvent(
      createEventDto.userId,
      createEventDto.title,
      createEventDto.eventDate,
      createEventDto.description,
      createEventDto.exerciseType,
    );
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
  async deleteEvent(@Param('eventId') eventId: string) {
    await this.eventsService.deleteEvent(eventId);
  }
}