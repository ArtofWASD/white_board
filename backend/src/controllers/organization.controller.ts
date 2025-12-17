import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('stats/:trainerId')
  async getTrainerStats(@Param('trainerId') trainerId: string) {
    try {
      const stats = await this.organizationService.getTrainerStats(trainerId);
      return stats;
    } catch (error) {

        throw new HttpException(
            'Failed to fetch organization stats',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }
}
