import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thread } from '../domain/entity/thread.entity';
import { Chat } from '../domain/entity/chat.entity';
import { AccountRole } from '../../auth/domain/enum/account-role.enum';
import { generateAnswer } from '../../common/openai/openai.provider';
import { AuthService } from '../../auth/application/service/auth.service';

@Injectable()
export class ChatBotService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadRepository: Repository<Thread>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    private readonly authService: AuthService,
  ) {}

  async createChat(
    accountId: string,
    question: string,
    model?: string,
  ): Promise<{ chat: Chat; thread: Thread }> {
    const thread = await this.getOrCreateThread(accountId);
    const answer = await generateAnswer(question, model);

    const chat = new Chat();
    chat.thread = thread;
    chat.question = question;
    chat.answer = answer;
    const savedChat = await this.chatRepository.save(chat);

    thread.lastActivityAt = savedChat.createdAt;
    await this.threadRepository.save(thread);

    return { chat: savedChat, thread };
  }

  async listChats(
    requesterId: string,
    role: AccountRole,
    page = 1,
    limit = 20,
    order: 'ASC' | 'DESC' = 'DESC',
  ) {
    const qb = this.threadRepository
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.chats', 'chat')
      .leftJoinAndSelect('thread.owner', 'owner');

    if (role !== AccountRole.ADMIN) {
      qb.where('owner.id = :requesterId', { requesterId });
    }

    qb.orderBy('thread.created_at', order)
      .addOrderBy('chat.created_at', order)
      .skip((page - 1) * limit)
      .take(limit);

    const [threads, total] = await qb.getManyAndCount();

    const data = threads.map((t) => ({
      threadId: t.id,
      createdAt: t.createdAt,
      lastActivityAt: t.lastActivityAt,
      chats: (t.chats || [])
        .sort((a, b) =>
          order === 'ASC'
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime(),
        )
        .map((c) => ({
          id: c.id,
          question: c.question,
          answer: c.answer,
          createdAt: c.createdAt,
        })),
    }));

    return { total, page, limit, order, threads: data };
  }

  async deleteThread(requesterId: string, role: AccountRole, threadId: string) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId },
      relations: { owner: true },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    if (role !== AccountRole.ADMIN && thread.owner.id !== requesterId)
      throw new UnauthorizedException('Cannot delete this thread');

    await this.threadRepository.softDelete(threadId);
    return { success: true };
  }

  private async getOrCreateThread(ownerId: string): Promise<Thread> {
    const owner = await this.authService.getAccountById(ownerId);

    const latest = await this.threadRepository.findOne({
      where: { owner: { id: ownerId } },
      order: { lastActivityAt: 'DESC' },
      relations: { chats: true },
    });

    const now = new Date();
    // 생성된 thread없으면 새로 생성.
    if (!latest) {
      const t = new Thread();
      t.owner = owner;
      t.lastActivityAt = now;
      return await this.threadRepository.save(t);
    }

    // thread 생성된지 30분 지났으면 새로 생성.
    const diffMs = now.getTime() - new Date(latest.lastActivityAt).getTime();
    const diffMinutes = diffMs / (1000 * 60);
    if (diffMinutes > 30) {
      const t = new Thread();
      t.owner = owner;
      t.lastActivityAt = now;
      return await this.threadRepository.save(t);
    }

    // 기존 쓰레드 사용.
    return latest;
  }
}
