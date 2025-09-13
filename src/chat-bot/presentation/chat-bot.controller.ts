import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatBotService } from '../service/chat-bot.service';
import { AuthGuard } from '../../common/jwt/jwt-auth.guard';
import {
  CreateChatReqDto,
  ChatResDto,
  ThreadWithChatsResDto,
} from './dto/chat.dto';
import type { Request } from 'express';
import { Req } from '@nestjs/common';
import { AuthService } from '../../auth/application/service/auth.service';

@Controller('chat-bot')
export class ChatBotController {
  constructor(
    private readonly chatBotService: ChatBotService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('chats')
  async createChat(
    @Req() req: Request,
    @Body() body: CreateChatReqDto,
  ): Promise<{ threadId: string; chat: ChatResDto }> {
    const accountId = (req as any).user?.sub as string;
    const { question, model } = body;
    const { chat, thread } = await this.chatBotService.createChat(
      accountId,
      question,
      model,
    );
    return { threadId: thread.id, chat: ChatResDto.of(chat) };
  }

  @UseGuards(AuthGuard)
  @Get('chats')
  async listChats(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    order: 'ASC' | 'DESC';
    threads: ThreadWithChatsResDto[];
  }> {
    const accountId = (req as any).user?.sub as string;
    const role = await this.authService.getAccountRole(accountId);
    return this.chatBotService.listChats(accountId, role, page, limit, order);
  }

  @UseGuards(AuthGuard)
  @Delete('threads/:id')
  async deleteThread(@Req() req: Request, @Param('id') id: string) {
    const accountId = (req as any).user?.sub as string;
    const role = await this.authService.getAccountRole(accountId);
    return this.chatBotService.deleteThread(accountId, role, id);
  }
}
