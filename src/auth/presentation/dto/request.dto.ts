import { IsNotEmpty, IsString } from 'class-validator';
import { AccountRole } from '../../domain/enum/account-role.enum';

export class AccountRegisterReqDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: AccountRole;
}

export class AccountLoginReqDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
