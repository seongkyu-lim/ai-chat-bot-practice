import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entity/base.entity';
import { AccountRole } from '../enum/account-role.enum';
import { AccountRegisterReqDto } from '../../presentation/dto/request.dto';

@Entity()
export class Account extends BaseEntity {
  // TODO: 암호화, 해싱.

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;
  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;
  @Column({
    name: 'role',
    type: 'enum',
    enum: AccountRole,
    default: AccountRole.MEMBER,
  })
  role: AccountRole;

  static from(requestDto: AccountRegisterReqDto) {
    const account = new Account();
    account.email = requestDto.email;
    account.password = requestDto.password;
    account.name = requestDto.name;
    account.role = requestDto.role;
    return account;
  }
}
