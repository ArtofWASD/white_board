import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  user: {
    count: jest.fn(),
    groupBy: jest.fn(),
    findMany: jest.fn(),
  },
  organization: {
    count: jest.fn(),
  },
  event: {
    count: jest.fn(),
  },
};

describe('StatisticsService', () => {
  let service: StatisticsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('getDashboardStats', () => {
    it('should return correct counts', async () => {
      prisma.user.count.mockResolvedValueOnce(10); // Total users
      prisma.organization.count.mockResolvedValue(5);
      prisma.event.count.mockResolvedValue(100);
      prisma.user.count.mockResolvedValueOnce(3); // Active users

      const result = await service.getDashboardStats();

      expect(result).toEqual({
        totalUsers: 10,
        totalOrganizations: 5,
        totalEvents: 100,
        activeUsersLast30Days: 3,
      });
      // Check active user query structure
      expect(prisma.user.count).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRegistrationHistory', () => {
    it('should fill missing days with 0 and count correctly', async () => {
      // Freeze time to make test deterministic
      const mockToday = new Date('2023-10-30T12:00:00.000Z');
      jest.useFakeTimers().setSystemTime(mockToday);

      const mockUsers = [
        { createdAt: new Date('2023-10-30T10:00:00.000Z') }, // Today
        { createdAt: new Date('2023-10-30T11:00:00.000Z') }, // Today again
        { createdAt: new Date('2023-10-29T10:00:00.000Z') }, // Yesterday
        // Gap
        { createdAt: new Date('2023-10-01T10:00:00.000Z') }, // Oldest within 30 days
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getRegistrationHistory();

      expect(result).toHaveLength(30);

      // Check specific dates
      const todayStr = '2023-10-30';
      const yesterdayStr = '2023-10-29';

      const todayStat = result.find((r) => r.date === todayStr);
      expect(todayStat?.count).toBe(2);

      const yesterdayStat = result.find((r) => r.date === yesterdayStr);
      expect(yesterdayStat?.count).toBe(1);

      const emptyDayStat = result.find((r) => r.date === '2023-10-15');
      expect(emptyDayStat?.count).toBe(0);
    });
  });

  describe('getRoleDistribution', () => {
    it('should return role distribution', async () => {
      const mockGroup = [
        { role: 'ATHLETE', _count: { role: 10 } },
        { role: 'TRAINER', _count: { role: 2 } },
      ];
      prisma.user.groupBy.mockResolvedValue(mockGroup);

      const result = await service.getRoleDistribution();
      expect(result).toEqual([
        { name: 'ATHLETE', value: 10 },
        { name: 'TRAINER', value: 2 },
      ]);
    });
  });
});
