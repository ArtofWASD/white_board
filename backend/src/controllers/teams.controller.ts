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
  Headers,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { TeamsService } from '../services/teams.service';
import {
  CreateTeamDto,
  AddTeamMemberDto,
  RemoveTeamMemberDto,
  UpdateTeamDto,
} from '../dtos/teams.dto';
import { extractUserIdFromToken } from '../utils/jwt.utils';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @Headers('authorization') authHeader: string,
  ) {
    // Extract user ID from JWT token
    const ownerId = extractUserIdFromToken(authHeader);

    if (!ownerId) {
      throw new UnauthorizedException('Authentication required');
    }

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
    @Headers('authorization') authHeader: string,
  ) {
    const userId = extractUserIdFromToken(authHeader);
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const result = await this.teamsService.deleteTeam(teamId, userId);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':teamId')
  async updateTeam(
    @Param('teamId') teamId: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Headers('authorization') authHeader: string,
  ) {
    const userId = extractUserIdFromToken(authHeader);
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

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
    @Headers('authorization') authHeader: string,
  ) {
    const userId = extractUserIdFromToken(authHeader);
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const result = await this.teamsService.refreshInviteCode(teamId, userId);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('invite/:code/join')
  async joinTeamByInvite(
    @Param('code') code: string,
    @Headers('authorization') authHeader: string,
  ) {
    const userId = extractUserIdFromToken(authHeader);
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    const result = await this.teamsService.joinTeamByInvite(code, userId);
    return result;
  }
}
