import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  Get,
  Delete,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { TeamsService } from '../services/teams.service';
import {
  CreateTeamDto,
  AddTeamMemberDto,
  RemoveTeamMemberDto,
  UpdateTeamDto,
} from '../dtos/teams.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  @Roles(UserRole.TRAINER, UserRole.ORGANIZATION_ADMIN, UserRole.SUPER_ADMIN)
  async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const ownerId = req.user.id;
    const result = await this.teamsService.createTeam(createTeamDto, ownerId);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post(':teamId/members/add')
  async addTeamMember(
    @Param('teamId') teamId: string,
    @Body() addTeamMemberDto: AddTeamMemberDto,
  ) {
    const result = await this.teamsService.addTeamMember(
      teamId,
      addTeamMemberDto,
    );
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':teamId/members/remove')
  async removeTeamMember(
    @Param('teamId') teamId: string,
    @Body() removeTeamMemberDto: RemoveTeamMemberDto,
  ) {
    const result = await this.teamsService.removeTeamMember(
      teamId,
      removeTeamMemberDto,
    );
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Get(':teamId/members')
  async getTeamMembers(@Param('teamId') teamId: string) {
    const result = await this.teamsService.getTeamMembers(teamId);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Get('user/:userId')
  async getUserTeams(@Param('userId') userId: string) {
    const result = await this.teamsService.getUserTeams(userId);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Get(':teamId')
  async getTeam(@Param('teamId') teamId: string) {
    const result = await this.teamsService.getTeamById(teamId);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':teamId')
  async deleteTeam(
    @Param('teamId') teamId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const result = await this.teamsService.deleteTeam(teamId, userId);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':teamId')
  async updateTeam(
    @Param('teamId') teamId: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const result = await this.teamsService.updateTeam(
      teamId,
      updateTeamDto,
      userId,
    );
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post(':teamId/invite')
  async refreshInviteCode(
    @Param('teamId') teamId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const result = await this.teamsService.refreshInviteCode(teamId, userId);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('invite/:code/join')
  async joinTeamByInvite(
    @Param('code') code: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    const result = await this.teamsService.joinTeamByInvite(code, userId);
    return result;
  }
}
