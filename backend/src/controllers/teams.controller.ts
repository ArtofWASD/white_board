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
} from '@nestjs/common';
import { TeamsService } from '../services/teams.service';
import {
  CreateTeamDto,
  AddTeamMemberDto,
  RemoveTeamMemberDto,
} from '../dtos/teams.dto';

@Controller('teams')
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async createTeam(@Request() req, @Body() createTeamDto: CreateTeamDto) {
    // In a real implementation, we would get the ownerId from the authenticated user
    // For now, we'll use a placeholder
    const ownerId = req.user?.id || 'placeholder-user-id';
    return await this.teamsService.createTeam(createTeamDto, ownerId);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':teamId/members/add')
  async addTeamMember(
    @Param('teamId') teamId: string,
    @Body() addTeamMemberDto: AddTeamMemberDto,
  ) {
    return await this.teamsService.addTeamMember(teamId, addTeamMemberDto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':teamId/members/remove')
  async removeTeamMember(
    @Param('teamId') teamId: string,
    @Body() removeTeamMemberDto: RemoveTeamMemberDto,
  ) {
    return await this.teamsService.removeTeamMember(
      teamId,
      removeTeamMemberDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get(':teamId/members')
  async getTeamMembers(@Param('teamId') teamId: string) {
    return await this.teamsService.getTeamMembers(teamId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('user/:userId')
  async getUserTeams(@Param('userId') userId: string) {
    return await this.teamsService.getUserTeams(userId);
  }
}
