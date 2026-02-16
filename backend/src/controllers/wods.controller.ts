import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WodsService } from '../services/wods.service';
import { CreateWodDto, UpdateWodDto } from '../dtos/wods.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('wods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WodsController {
  constructor(private readonly wodsService: WodsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UsePipes(new ValidationPipe())
  create(@Body() createWodDto: CreateWodDto) {
    return this.wodsService.create(createWodDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.wodsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wodsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() updateWodDto: UpdateWodDto) {
    return this.wodsService.update(id, updateWodDto);
  }

  @Public()
  @Patch(':id/rate')
  updateRating(@Param('id') id: string, @Body('delta') delta: number) {
    return this.wodsService.updateRating(id, delta);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN)
  remove(@Param('id') id: string) {
    return this.wodsService.remove(id);
  }
}
