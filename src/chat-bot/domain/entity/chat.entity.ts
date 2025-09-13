import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { Thread } from './thread.entity';

@Entity()
export class Chat extends BaseEntity {
  @Column({ type: 'text', name: 'question' })
  question: string;

  @Column({ type: 'text', name: 'answer' })
  answer: string;

  @ManyToOne(() => Thread, (thread) => thread.chats, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  thread: Thread;
}
