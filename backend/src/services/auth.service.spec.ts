import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { RegisterDto } from '../dtos/auth.dto';
import { SafeUser } from '../types';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt module
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock dependencies
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data without password if validation succeeds', async () => {
      const mockUser = {
        id: 'user_id',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'ATHLETE',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await service.validateUser(
        'notfound@example.com',
        'password',
      );
      expect(result).toBeNull();
    });

    it('should return null if password mismatch', async () => {
      const mockUser = {
        id: 'user_id',
        email: 'test@example.com',
        password: 'hashed_password',
      };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return jwt token and user info', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const mockUser = {
        id: 'user_id',
        email: 'test@example.com',
        role: 'ATHLETE',
      };
      // Mock internal call to validateUser
      jest
        .spyOn(service, 'validateUser')
        .mockResolvedValue(mockUser as unknown as SafeUser);

      const result = await service.login(loginDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);
      await expect(
        service.login({ email: 'a', password: 'b' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'John',
        lastName: 'Doe',
        role: UserRole.ATHLETE,
        gender: 'MALE',
      } as RegisterDto;

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new_id',
        ...registerDto,
        password: 'hashed_password',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.register(registerDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('new@example.com');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'exists' });
      const registerDto = {
        email: 'exists@example.com',
        password: 'password123',
        name: 'John',
        lastName: 'Doe',
        role: UserRole.ATHLETE,
        gender: 'MALE',
      } as RegisterDto;

      await expect(service.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
