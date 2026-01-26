import { Controller, Get, Patch, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') role: UserRole,
  ) {
    return this.usersService.updateRole(id, role);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('isBlocked') isBlocked: boolean,
  ) {
    return this.usersService.updateStatus(id, isBlocked);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteUser(id);
  }
}
