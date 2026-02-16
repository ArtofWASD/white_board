import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { SettingsService } from '../services/settings.service';
import { ForbiddenException } from '@nestjs/common';
import { Response, Request } from 'express';
import { RegisterDto } from '../dtos/auth.dto';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  updateProfile: jest.fn(),
  lookupUserByEmail: jest.fn(),
  getUser: jest.fn(),
  getAthletes: jest.fn(),
};

const mockSettingsService = {
  getAll: jest.fn(),
};

const mockResponse = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
} as unknown as Response;

const mockRequest = {
  ip: '127.0.0.1',
  cookies: {},
} as unknown as Request;

describe('AuthController', () => {
  let controller: AuthController;
  let authService: typeof mockAuthService;
  let settingsService: typeof mockSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    settingsService = module.get(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ForbiddenException if MAINTENANCE_MODE is true', async () => {
      settingsService.getAll.mockResolvedValue([
        { key: 'MAINTENANCE_MODE', value: 'true' },
      ]);
      await expect(
        controller.register(
          {} as unknown as RegisterDto,
          mockRequest,
          mockResponse,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if ATHLETE registration is disabled', async () => {
      settingsService.getAll.mockResolvedValue([
        { key: 'MAINTENANCE_MODE', value: 'false' },
        { key: 'REGISTRATION_ATHLETE', value: 'false' },
      ]);
      await expect(
        controller.register(
          { role: 'ATHLETE' } as unknown as RegisterDto,
          mockRequest,
          mockResponse,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should call authService.register if checks pass', async () => {
      settingsService.getAll.mockResolvedValue([]);
      authService.register.mockResolvedValue({
        user: { id: '1' },
        accessToken: 'abc',
        refreshToken: 'xyz',
      });

      const body = {
        role: 'ATHLETE',
        email: 'test@test.com',
      } as unknown as RegisterDto;
      await controller.register(body, mockRequest, mockResponse);
      expect(authService.register).toHaveBeenCalledWith(
        body,
        expect.any(String),
      );
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      authService.login.mockResolvedValue({
        user: { id: '1' },
        accessToken: 'abc',
        refreshToken: 'xyz',
      });
      const dto = { email: 'test@test.com', password: 'pas' };
      await controller.login(dto, mockResponse);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });
});
