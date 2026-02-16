import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TeamRole } from '@prisma/client';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
  team: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  teamMember: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('TeamsService', () => {
  let service: TeamsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTeam', () => {
    it('should create team if owner exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'owner1',
        organizationName: 'Org',
      });
      prisma.team.create.mockResolvedValue({ id: 'team1', name: 'Team A' });

      const dto = { name: 'Team A', description: 'Desc' };
      const result = await service.createTeam(dto, 'owner1');

      expect(result).toEqual({ id: 'team1', name: 'Team A' });
      expect(prisma.team.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if owner not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.createTeam({ name: 'A' }, 'owner1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addTeamMember', () => {
    it('should add member successfully', async () => {
      prisma.team.findUnique.mockResolvedValue({ id: 'team1' });
      prisma.user.findUnique.mockResolvedValue({ id: 'user1' });
      prisma.teamMember.findUnique.mockResolvedValue(null); // Not a member yet
      prisma.teamMember.create.mockResolvedValue({
        userId: 'user1',
        teamId: 'team1',
      });

      const dto = { userId: 'user1', role: TeamRole.MEMBER };
      const result = await service.addTeamMember('team1', dto);

      expect(result).toBeDefined();
      expect(prisma.teamMember.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if team not found', async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      await expect(
        service.addTeamMember('t1', { userId: 'u1', role: 'MEMBER' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user already member', async () => {
      prisma.team.findUnique.mockResolvedValue({ id: 't1' });
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      prisma.teamMember.findUnique.mockResolvedValue({ id: 'm1' });
      await expect(
        service.addTeamMember('t1', { userId: 'u1', role: 'MEMBER' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
