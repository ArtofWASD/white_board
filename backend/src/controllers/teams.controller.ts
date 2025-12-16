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
} from '@nestjs/common';
import { TeamsService } from '../services/teams.service';
import {
  CreateTeamDto,
  AddTeamMemberDto,
  RemoveTeamMemberDto,
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
}
