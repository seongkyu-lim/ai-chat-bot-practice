import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { Account } from './account.entity';

@Entity()
export class SignupHistory extends BaseEntity {
  @ManyToOne(() => Account, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  account: Account;
}
