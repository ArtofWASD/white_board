import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { CreateDirectChatDto, SendMessageDto } from '../dtos/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('direct')
  async createDirectChat(
    @Request() req: any,
    @Body() createDirectChatDto: CreateDirectChatDto,
  ) {
    const userId = req.user.id;
    return this.chatService.createDirectChat(userId, createDirectChatDto);
  }

  @Get('team/:teamId')
  async getTeamChat(@Request() req: any, @Param('teamId') teamId: string) {
    const userId = req.user.id;
    return this.chatService.getTeamChat(teamId, userId);
  }

  @Get()
  async getUserChats(@Request() req: any) {
    const userId = req.user.id;
    return this.chatService.getUserChats(userId);
  }

  @Get(':chatId/messages')
  async getMessages(
    @Request() req: any,
    @Param('chatId') chatId: string,
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ) {
    const userId = req.user.id;
    return this.chatService.getMessages(
      chatId,
      userId,
      limit ? Number(limit) : 50,
      skip ? Number(skip) : 0,
    );
  }

  @Post(':chatId/messages')
  async sendMessage(
    @Request() req: any,
    @Param('chatId') chatId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const userId = req.user.id;
    return this.chatService.sendMessage(chatId, userId, sendMessageDto);
  }
}
