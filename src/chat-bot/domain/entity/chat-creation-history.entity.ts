import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { Account } from '../../../auth/domain/entity/account.entity';
import { Chat } from './chat.entity';

@Entity()
export class ChatCreationHistory extends BaseEntity {
  @ManyToOne(() => Account, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  account: Account;

  @ManyToOne(() => Chat, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  chat: Chat;
}
