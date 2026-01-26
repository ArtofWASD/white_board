import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticsService } from '../services/statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.statisticsService.getDashboardStats();
  }

  @Get('registrations')
  getRegistrationHistory() {
    return this.statisticsService.getRegistrationHistory();
  }

  @Get('roles')
  getRoleDistribution() {
    return this.statisticsService.getRoleDistribution();
  }
}
