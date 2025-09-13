import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback, FeedbackStatus } from '../domain/entity/feedback.entity';
import { Chat } from '../../chat-bot/domain/entity/chat.entity';
import { Account } from '../../auth/domain/entity/account.entity';
import { AccountRole } from '../../auth/domain/enum/account-role.enum';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(
    accountId: string,
    role: AccountRole,
    chatId: string,
    isPositive: boolean,
  ) {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: { thread: { owner: true } },
    });
    if (!chat) throw new NotFoundException('Chat not found');

    if (role !== AccountRole.ADMIN && chat.thread.owner.id !== accountId) {
      throw new UnauthorizedException('Cannot leave feedback for this chat');
    }

    const author = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!author) throw new UnauthorizedException('Invalid user');

    const exists = await this.feedbackRepository.exists({
      where: { author: { id: author.id }, chat: { id: chat.id } },
    });
    if (exists)
      throw new BadRequestException(
        'Feedback already exists for this chat by this user',
      );

    const entity = new Feedback();
    entity.author = author;
    entity.chat = chat;
    entity.isPositive = isPositive;
    entity.status = 'PENDING';

    const saved = await this.feedbackRepository.save(entity);
    return saved;
  }

  async list(
    accountId: string,
    role: AccountRole,
    page = 1,
    limit = 20,
    order: 'ASC' | 'DESC' = 'DESC',
    isPositive?: boolean,
  ) {
    const qb = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.author', 'author')
      .leftJoinAndSelect('feedback.chat', 'chat');

    if (role !== AccountRole.ADMIN) {
      qb.where('author.id = :accountId', { accountId });
    }

    if (typeof isPositive === 'boolean') {
      qb.andWhere('feedback.is_positive = :isPositive', { isPositive });
    }

    qb.orderBy('feedback.created_at', order)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      total,
      page,
      limit,
      order,
      items: items.map((f) => ({
        id: f.id,
        authorId: f.author.id,
        chatId: f.chat.id,
        isPositive: f.isPositive,
        status: f.status,
        createdAt: f.createdAt,
      })),
    };
  }

  async updateStatus(
    requesterRole: AccountRole,
    feedbackId: string,
    status: FeedbackStatus,
  ) {
    if (requesterRole !== AccountRole.ADMIN)
      throw new ForbiddenException('Only admin can update status');
    const fb = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });
    if (!fb) throw new NotFoundException('Feedback not found');
    fb.status = status;
    await this.feedbackRepository.save(fb);
    return { success: true };
  }
}
