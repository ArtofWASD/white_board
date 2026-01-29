import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesService } from './exercises.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  userExercise: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  exerciseRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('ExercisesService', () => {
  let service: ExercisesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createExercise', () => {
    it('should create exercise without initial weight', async () => {
      prisma.userExercise.create.mockResolvedValue({ id: 'ex1', name: 'Pushup' });
      
      const result = await service.createExercise('user1', 'Pushup');
      
      expect(result).toEqual({ id: 'ex1', name: 'Pushup' });
      expect(prisma.exerciseRecord.create).not.toHaveBeenCalled();
    });

    it('should create exercise WITH initial weight', async () => {
      prisma.userExercise.create.mockResolvedValue({ id: 'ex1', name: 'Squat' });
      
      await service.createExercise('user1', 'Squat', 100);
      
      expect(prisma.exerciseRecord.create).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ weight: 100, exerciseId: 'ex1' })
      }));
    });
  });

  describe('getExercisesByUserId', () => {
      it('should return exercises with calculated maxWeight', async () => {
          const mockExercises = [
              {
                  id: 'ex1',
                  records: [
                      { weight: 50 },
                      { weight: 60 },
                      { weight: 55 }
                  ]
              },
              {
                  id: 'ex2',
                  records: [] // No records
              }
          ];
          prisma.userExercise.findMany.mockResolvedValue(mockExercises);

          const result = await service.getExercisesByUserId('user1');

          expect(result).toHaveLength(2);
          expect(result[0].maxWeight).toBe(60);
          expect(result[1].maxWeight).toBe(0);
      });
  });

  describe('addExerciseRecord', () => {
      it('should add record to existing exercise', async () => {
          prisma.userExercise.findUnique.mockResolvedValue({ id: 'ex1' });
          prisma.exerciseRecord.create.mockResolvedValue({ id: 'rec1', weight: 70 });

          const result = await service.addExerciseRecord('ex1', 70);
          expect(result).toEqual({ id: 'rec1', weight: 70 });
      });

      it('should throw NotFoundException if exercise does not exist', async () => {
          prisma.userExercise.findUnique.mockResolvedValue(null);
          await expect(service.addExerciseRecord('ex1', 70)).rejects.toThrow(NotFoundException);
      });
  });
});
