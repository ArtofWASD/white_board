/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { randomBytes } from 'crypto';
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
    // Сначала проверяем, существует ли владелец
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
        organizationName: owner.organizationName, // Копируем имя организации от владельца
        members: {
          create: [],
        },
      },
    });

    return team;
  }

  async addTeamMember(teamId: string, addTeamMemberDto: AddTeamMemberDto) {
    // Проверяем, существует ли команда
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Проверяем, существует ли пользователь
    const user = await (this.prisma as any).user.findUnique({
      where: { id: addTeamMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, существует ли уже участник в команде
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

    // Добавляем участника в команду
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
    // Проверяем, существует ли команда
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Проверяем, существует ли пользователь
    const user = await (this.prisma as any).user.findUnique({
      where: { id: removeTeamMemberDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, существует ли участник в команде
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

    // Удаляем участника из команды
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


    // Проверяем, существует ли команда
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });



    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Получаем всех участников команды
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
    // Проверяем, существует ли пользователь
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Получаем все команды, где пользователь является владельцем
    const ownedTeams = await (this.prisma as any).team.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
          },
        },
        members: {
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
        },
      },
    });

    // Получаем все команды, в которых пользователь является участником
    const teamMemberships = await (this.prisma as any).teamMember.findMany({
      where: { userId: userId },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
              },
            },
            members: {
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
            },
          },
        },
      },
    });

    const memberTeams = teamMemberships.map((tm: any) => tm.team);
    let allTeams = [...ownedTeams, ...memberTeams];

    // Если пользователь является администратором организации, добавляем все команды из организации
    if (user.role === 'organization_admin' && user.organizationName) {
        const orgTeams = await (this.prisma as any).team.findMany({
            where: { organizationName: user.organizationName }
        });
        allTeams = [...allTeams, ...orgTeams];
    }

    // Удаляем дубликаты по id
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

  async refreshInviteCode(teamId: string, userId: string) {
    const team = await (this.prisma as any).team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can generate invite codes');
    }

    // Генерируем случайную 8-символьную шестнадцатеричную строку (например, "a1b2c3d4")
    const inviteCode = randomBytes(4).toString('hex');

    const updatedTeam = await (this.prisma as any).team.update({
      where: { id: teamId },
      data: {
        inviteCode,
        inviteCodeCreatedAt: new Date(),
      },
    });

    return { inviteCode: updatedTeam.inviteCode };
  }

  async joinTeamByInvite(code: string, userId: string) {
    // Находим команду по коду приглашения
    const team = await (this.prisma as any).team.findUnique({
      where: { inviteCode: code },
    });

    if (!team) {
      throw new NotFoundException('Invalid or expired invite code');
    }

    // Проверяем, существует ли пользователь
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, уже ли участник есть в команде
    const existingMember = await (this.prisma as any).teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: userId,
        },
      },
    });

    if (existingMember) {
      return { message: 'Already a member of this team', teamId: team.id };
    }

    // Добавляем участника в команду
    await (this.prisma as any).teamMember.create({
      data: {
        teamId: team.id,
        userId: userId,
        role: 'MEMBER', // Должность по умолчанию для приглашенных пользователей
      },
    });

    return { message: 'Successfully joined team', teamId: team.id };
  }
}
