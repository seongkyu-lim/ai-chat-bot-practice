import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { Account } from '../../../auth/domain/entity/account.entity';
import { Chat } from './chat.entity';

@Entity()
export class Thread extends BaseEntity {
  @ManyToOne(() => Account, { createForeignKeyConstraints: false })
  owner: Account;

  @OneToMany(() => Chat, (chat) => chat.thread, { cascade: ['insert'] })
  chats: Chat[];

  @Column({ type: 'timestamp', name: 'last_activity_at' })
  lastActivityAt: Date;
}
