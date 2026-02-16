import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('organization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('stats/:trainerId')
  async getTrainerStats(@Param('trainerId') trainerId: string) {
    try {
      const stats = await this.organizationService.getTrainerStats(trainerId);
      return stats;
    } catch {
      throw new HttpException(
        'Failed to fetch organization stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('admin/all')
  @Roles(UserRole.SUPER_ADMIN)
  async getAllOrganizations() {
    try {
      const orgs = await this.organizationService.getAllForAdmin();
      return orgs;
    } catch {
      throw new HttpException(
        'Failed to fetch organizations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/block')
  @Roles(UserRole.SUPER_ADMIN)
  async toggleBlockStatus(
    @Param('id') id: string,
    @Body('isBlocked') isBlocked: boolean,
  ) {
    try {
      return await this.organizationService.toggleBlockStatus(id, isBlocked);
    } catch {
      throw new HttpException(
        'Failed to update block status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
