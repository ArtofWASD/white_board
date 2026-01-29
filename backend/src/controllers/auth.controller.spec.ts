import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { SettingsService } from '../services/settings.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

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
          settingsService.getAll.mockResolvedValue([{ key: 'MAINTENANCE_MODE', value: 'true' }]);
          await expect(controller.register({})).rejects.toThrow(ForbiddenException);
      });

      it('should throw ForbiddenException if ATHLETE registration is disabled', async () => {
          settingsService.getAll.mockResolvedValue([
              { key: 'MAINTENANCE_MODE', value: 'false' },
              { key: 'REGISTRATION_ATHLETE', value: 'false' }
          ]);
          await expect(controller.register({ role: 'ATHLETE' })).rejects.toThrow(ForbiddenException);
      });

      it('should call authService.register if checks pass', async () => {
        settingsService.getAll.mockResolvedValue([]);
        authService.register.mockResolvedValue({ user: { id: '1' }, token: 'abc' });
        
        const body = { role: 'ATHLETE', email: 'test@test.com' };
        await controller.register(body);
        expect(authService.register).toHaveBeenCalledWith(body);
      });
  });

  describe('login', () => {
      it('should call authService.login', async () => {
          const dto = { email: 'test@test.com', password: 'pas' };
          await controller.login(dto);
          expect(authService.login).toHaveBeenCalledWith(dto);
      });
  });
});
