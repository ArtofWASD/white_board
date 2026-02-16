import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDirectChatDto, SendMessageDto } from '../dtos/chat.dto';
import { NotificationsService } from './notifications.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createDirectChat(
    userId: string,
    createDirectChatDto: CreateDirectChatDto,
  ) {
    const { targetUserId } = createDirectChatDto;

    // Check if chat already exists
    await this.prisma.chat.findFirst({
      where: {
        type: 'direct',
        participants: {
          every: {
            userId: { in: [userId, targetUserId] },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // We need to double check that both users are participants because 'every' logic can be tricky with exact matches
    // But for now, let's try to find a chat where both are participants.
    // Actually, the correct query for "chat with exactly these 2 participants" is harder in Prisma.
    // A simpler way: find chats for user 1, then filter in memory or via improved query.

    // Better query:
    const validChat = await this.prisma.chat.findFirst({
      where: {
        type: 'direct',
        AND: [
          { participants: { some: { userId: userId } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, lastName: true, role: true },
            },
          },
        },
      },
    });

    if (validChat) {
      return validChat;
    }

    // Create new chat
    return this.prisma.chat.create({
      data: {
        type: 'direct',
        participants: {
          create: [{ userId }, { userId: targetUserId }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, lastName: true, role: true },
            },
          },
        },
      },
    });
  }

  async getTeamChat(teamId: string, userId: string) {
    // Verify user is member or owner of team
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isMember = team.members.some((m) => m.userId === userId);
    const isOwner = team.ownerId === userId;

    if (!isMember && !isOwner) {
      throw new ForbiddenException('You are not a member of this team');
    }

    let chat = await this.prisma.chat.findFirst({
      where: {
        type: 'group',
        teamId,
      },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      // Create team chat if it doesn't exist (lazy creation)
      // Add all current team members and owner as participants
      const participantData: { userId: string; role?: string }[] =
        team.members.map((m) => ({
          userId: m.userId,
          role: m.role ? m.role.toString() : undefined,
        }));

      // If owner is not in members list, add them explicitly
      if (!team.members.some((m) => m.userId === team.ownerId)) {
        participantData.push({
          userId: team.ownerId,
          role: 'owner',
        });
      }

      chat = await this.prisma.chat.create({
        data: {
          type: 'group',
          teamId,
          participants: {
            create: participantData,
          },
        },
        include: {
          participants: true,
        },
      });
    } else {
      // Ensure current user is a participant if they are accessing it (e.g. new member or owner)
      const isParticipant = chat.participants.some((p) => p.userId === userId);
      if (!isParticipant) {
        await this.prisma.chatParticipant.create({
          data: {
            chatId: chat.id,
            userId: userId,
            role: isOwner ? 'owner' : 'member',
          },
        });
        // Re-fetch chat with new participant
        chat = await this.prisma.chat.findUnique({
          where: { id: chat.id },
          include: { participants: true },
        });
      }
    }

    return chat;
  }

  async getUserChats(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, lastName: true, role: true },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        team: {
          select: { name: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getMessages(chatId: string, userId: string, limit = 50, skip = 0) {
    // Verify participation
    const participation = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participation) {
      throw new ForbiddenException('Access denied');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            lastName: true,
          },
        },
      },
    });

    return messages.reverse();
  }

  async sendMessage(
    chatId: string,
    userId: string,
    sendMessageDto: SendMessageDto,
  ) {
    const { content, type } = sendMessageDto;

    // Verify participation
    const participation = await this.prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participation) {
      throw new ForbiddenException('Access denied');
    }

    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        content,
        type: type || 'text',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            lastName: true,
            role: true, // Needed for notification title possibly
          },
        },
      },
    });

    // Update chat updatedAt
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Get all other participants to send notifications
    const otherParticipants = await this.prisma.chatParticipant.findMany({
      where: {
        chatId,
        userId: { not: userId },
      },
    });

    const senderName =
      `${message.sender.name} ${message.sender.lastName || ''}`.trim();

    for (const participant of otherParticipants) {
      await this.notificationsService.createNotification(
        participant.userId,
        'CHAT_MESSAGE',
        type === 'image'
          ? 'Изображение'
          : content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        {
          chatId,
          senderId: userId,
          messageId: message.id,
        },
        `Новое сообщение от ${senderName}`,
      );
    }

    return message;
  }
}
