import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { Account } from '../../../auth/domain/entity/account.entity';
import { Chat } from '../../../chat-bot/domain/entity/chat.entity';

export type FeedbackStatus = 'PENDING' | 'RESOLVED';

@Entity()
@Index(['author', 'chat'], { unique: true })
export class Feedback extends BaseEntity {
  @ManyToOne(() => Account, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  author: Account;

  @ManyToOne(() => Chat, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  chat: Chat;

  @Column({ type: 'boolean', name: 'is_positive' })
  isPositive: boolean;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: FeedbackStatus;
}
