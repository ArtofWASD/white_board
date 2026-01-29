import { Test, TestingModule } from '@nestjs/testing';
import { WodsService } from './wods.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  wod: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('WodsService', () => {
  let service: WodsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WodsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WodsService>(WodsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a WOD', async () => {
      const dto = { name: 'Fran', type: 'For Time' };
      prisma.wod.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto as any);
      expect(result).toEqual({ id: '1', name: 'Fran', type: 'For Time' });
    });
  });

  describe('findOne', () => {
      it('should return a WOD if found', async () => {
          prisma.wod.findUnique.mockResolvedValue({ id: '1' });
          expect(await service.findOne('1')).toEqual({ id: '1' });
      });

      it('should throw NotFoundException if not found', async () => {
          prisma.wod.findUnique.mockResolvedValue(null);
          await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      });
  });

  describe('update', () => {
      it('should update a WOD', async () => {
          prisma.wod.update.mockResolvedValue({ id: '1', name: 'New Name' });
          const result = await service.update('1', { name: 'New Name' });
          expect(result.name).toBe('New Name');
      });

      it('should throw NotFoundException if update fails', async () => {
          prisma.wod.update.mockRejectedValue(new Error('Record not found'));
          await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
      });
  });

  describe('remove', () => {
      it('should remove a WOD', async () => {
          prisma.wod.delete.mockResolvedValue({ id: '1' });
          await service.remove('1');
          expect(prisma.wod.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      });

      it('should throw NotFoundException if remove fails', async () => {
          prisma.wod.delete.mockRejectedValue(new Error('Record not found'));
          await expect(service.remove('1')).rejects.toThrow(NotFoundException);
      });
  });
});
