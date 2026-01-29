import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  event: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
  team: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  teamMember: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  eventResult: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('EventsService', () => {
  let service: EventsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user1' });
      prisma.event.create.mockResolvedValue({ id: 'event1', title: 'Test' });

      const result = await service.createEvent(
        'user1',
        'Test Event',
        new Date().toISOString(),
      );
      expect(result).toEqual({ id: 'event1', title: 'Test' });
      expect(prisma.event.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.createEvent('user1', 'Test', new Date().toISOString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw Error for invalid date', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user1' });
      await expect(
        service.createEvent('user1', 'Test', 'invalid-date'),
      ).rejects.toThrow('Invalid date format');
    });
  });

  describe('deleteEvent', () => {
    it('should delete event if user is owner', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'event1', userId: 'user1' });
      
      await service.deleteEvent('event1', 'user1');
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 'event1' } });
    });

    it('should throw ForbiddenException if user is not owner and has no other permissions', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'event1', userId: 'other' });
      prisma.team.findMany.mockResolvedValue([]); // not owner of any team
      prisma.teamMember.findMany.mockResolvedValue([]); // not admin of any team
      prisma.user.findUnique.mockResolvedValue({ id: 'user1', role: 'ATHLETE' });

      await expect(
        service.deleteEvent('event1', 'user1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should delete event if user is owner of the team the event belongs to', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'event1', userId: 'other', teamId: 'team1' });
      prisma.team.findUnique.mockResolvedValue({ id: 'team1', ownerId: 'user1' }); // User owns the team

      await service.deleteEvent('event1', 'user1');
      expect(prisma.event.delete).toHaveBeenCalled();
    });
  });
});
