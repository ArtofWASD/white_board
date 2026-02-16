import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from '../services/events.service';
import { BadRequestException } from '@nestjs/common';
import { CreateEventDto } from '../dtos/events.dto';

const mockEventsService = {
  createEvent: jest.fn(),
  deleteEvent: jest.fn(),
  updateEvent: jest.fn(),
  getEventsByUserId: jest.fn(),
  getPastEventsByUserId: jest.fn(),
  getFutureEventsByUserId: jest.fn(),
  updateEventStatus: jest.fn(),
  createEventResult: jest.fn(),
  getEventResults: jest.fn(),
  getEventResultsByUserId: jest.fn(),
  getDebugInfo: jest.fn(),
};

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: typeof mockEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockEventsService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should call service.createEvent', async () => {
      const dto = {
        userId: 'u1',
        title: 'T',
        eventDate: '2023-01-01',
      };
      await controller.createEvent(dto as unknown as CreateEventDto);
      expect(eventsService.createEvent).toHaveBeenCalled();
    });

    it('should wrap "Invalid date format" error in BadRequestException', async () => {
      eventsService.createEvent.mockRejectedValue(
        new Error('Invalid date format'),
      );
      await expect(
        controller.createEvent({} as unknown as CreateEventDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteEvent', () => {
    it('should throw BadRequestException if userId is missing in body', async () => {
      await expect(
        controller.deleteEvent('id', {} as unknown as { userId?: string }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service.deleteEvent if userId is provided', async () => {
      await controller.deleteEvent('id', { userId: 'u1' });
      expect(eventsService.deleteEvent).toHaveBeenCalledWith('id', 'u1');
    });
  });
});
