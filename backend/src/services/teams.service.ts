/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTeamDto,
  AddTeamMemberDto,
  RemoveTeamMemberDto,
  UpdateTeamDto,
} from '../dtos/teams.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async createTeam(createTeamDto: CreateTeamDto, ownerId: string) {
    // First check if owner exists
    const owner = await (this.prisma as any).user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const team = await (this.prisma as any).team.create({
      data: {
        name: createTeamDto.name,
        description: createTeamDto.description,
        ownerId: ownerId,
        organizationName: owner.organizationName, // Copy organization name from owner
        members: {
          create: [],
        },
      },
    });

    return team;
  }

  async addTeamMember(teamId: string, addTeamMemberDto: AddTeamMemberDto) {
    // Check if team exists
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user exists
    const user = await (this.prisma as any).user.findUnique({
      where: { id: addTeamMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if member already exists in team
    const existingMember = await (this.prisma as any).teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId,
          userId: addTeamMemberDto.userId,
        },
      },
    });

    if (existingMember) {
      throw new NotFoundException('User is already a member of this team');
    }

    // Add member to team
    const teamMember = await (this.prisma as any).teamMember.create({
      data: {
        teamId: teamId,
        userId: addTeamMemberDto.userId,
        role: addTeamMemberDto.role,
      },
    });

    return teamMember;
  }

  async removeTeamMember(
    teamId: string,
    removeTeamMemberDto: RemoveTeamMemberDto,
  ) {
    // Check if team exists
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user exists
    const user = await (this.prisma as any).user.findUnique({
      where: { id: removeTeamMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if member exists in team
    const existingMember = await (this.prisma as any).teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId,
          userId: removeTeamMemberDto.userId,
        },
      },
    });

    if (!existingMember) {
      throw new NotFoundException('User is not a member of this team');
    }

    // Remove member from team
    await (this.prisma as any).teamMember.delete({
      where: {
        teamId_userId: {
          teamId: teamId,
          userId: removeTeamMemberDto.userId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }

  async getTeamMembers(teamId: string) {
    console.log('Getting team members for team ID:', teamId);
    console.log('Team ID type:', typeof teamId);

    // Check if team exists
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });

    console.log('Team lookup result:', team);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Get all members of the team
    const members = await (this.prisma as any).teamMember.findMany({
      where: { teamId: teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return members;
  }

  async getUserTeams(userId: string) {
    // Check if user exists
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all teams where the user is the owner
    const ownedTeams = await (this.prisma as any).team.findMany({
      where: { ownerId: userId },
    });

    // Get all teams the user belongs to as a member
    const teamMemberships = await (this.prisma as any).teamMember.findMany({
      where: { userId: userId },
      include: {
        team: true,
      },
    });

    const memberTeams = teamMemberships.map((tm: any) => tm.team);
    let allTeams = [...ownedTeams, ...memberTeams];

    // If user is organization admin, add all teams from the organization
    if (user.role === 'organization_admin' && user.organizationName) {
        const orgTeams = await (this.prisma as any).team.findMany({
            where: { organizationName: user.organizationName }
        });
        allTeams = [...allTeams, ...orgTeams];
    }

    // Remove duplicates by id
    const uniqueTeams = allTeams.filter(
      (team, index, self) => index === self.findIndex((t) => t.id === team.id),
    );

    return uniqueTeams;
  }

  async getTeamById(teamId: string) {
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async deleteTeam(teamId: string, userId: string) {
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete the team');
    }

    await (this.prisma as any).team.delete({
      where: { id: teamId },
    });

    return { message: 'Team deleted successfully' };
  }

  async updateTeam(
    teamId: string,
    updateTeamDto: UpdateTeamDto,
    userId: string,
  ) {
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update the team');
    }

    const updatedTeam = await (this.prisma as any).team.update({
      where: { id: teamId },
      data: {
        ...updateTeamDto,
      },
    });

    return updatedTeam;
  }
}
