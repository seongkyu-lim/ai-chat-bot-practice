import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SignupHistory } from '../../auth/domain/entity/signup-history.entity';
import { LoginHistory } from '../../auth/domain/entity/login-history.entity';
import { ChatCreationHistory } from '../../chat-bot/domain/entity/chat-creation-history.entity';
import { Chat } from '../../chat-bot/domain/entity/chat.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SignupHistory)
    private readonly signupHistoryRepository: Repository<SignupHistory>,
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
    @InjectRepository(ChatCreationHistory)
    private readonly chatCreationHistoryRepository: Repository<ChatCreationHistory>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  private getWindowDates(hours = 24) {
    const to = new Date();
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
    return { from, to };
  }

  async getActivityCountsLast24h() {
    const { from, to } = this.getWindowDates(24);

    const [signups, logins, chatCreations] = await Promise.all([
      this.signupHistoryRepository.count({
        where: { createdAt: Between(from, to) },
      }),
      this.loginHistoryRepository.count({
        where: { createdAt: Between(from, to) },
      }),
      this.chatCreationHistoryRepository.count({
        where: { createdAt: Between(from, to) },
      }),
    ]);

    return { from, to, signups, logins, chatCreations };
  }

  async generateChatsCsvLast24h(): Promise<string> {
    const { from, to } = this.getWindowDates(24);
    const chats = await this.chatRepository.find({
      where: { createdAt: Between(from, to) },
      relations: { thread: { owner: true } },
      order: { createdAt: 'ASC' },
    });

    const header = [
      'chatId',
      'question',
      'answer',
      'threadId',
      'userId',
      'userEmail',
      'createdAt',
    ];

    const escapeCsv = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (/[",\n]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    const rows = chats.map((c) => [
      c.id,
      c.question,
      c.answer,
      c.thread?.id,
      c.thread?.owner?.id,
      (c.thread as any)?.owner?.email,
      c.createdAt.toISOString(),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');

    return csv;
  }
}
