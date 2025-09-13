import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthUseCase } from '../use-case/auth.use-case';
import {
  AccountRegisterReqDto,
  AccountLoginReqDto,
} from '../../presentation/dto/request.dto';
import { Account } from '../../domain/entity/account.entity';
import { AccountLoginResDto } from '../../presentation/dto/response.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AccountRole } from '../../domain/enum/account-role.enum';

@Injectable()
export class AuthService implements AuthUseCase {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly jwtService: JwtService,
  ) {}

  async register(requestDto: AccountRegisterReqDto): Promise<string> {
    if (
      await this.accountRepository.exists({
        where: { email: requestDto.email },
      })
    )
      throw new BadRequestException('Email already exists.');

    await this.accountRepository.save(Account.from(requestDto));
    return 'success';
  }

  async login(requestDto: AccountLoginReqDto): Promise<AccountLoginResDto> {
    const foundAccount = await this.accountRepository.findOne({
      where: { email: requestDto.email },
    });

    if (!foundAccount) throw new UnauthorizedException('Email not found.');
    if (foundAccount.password !== requestDto.password)
      throw new UnauthorizedException('Password not match.');

    return AccountLoginResDto.of(
      await this.jwtService.signAsync({ sub: foundAccount.id }),
      await this.jwtService.signAsync(
        { sub: foundAccount.id },
        {
          expiresIn: '14d',
        },
      ),
    );
  }

  async getAccountRole(accountId: string): Promise<AccountRole> {
    const acc = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!acc) throw new UnauthorizedException();
    return acc.role;
  }

  async getAccountById(accountId: string): Promise<Account> {
    const acc = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!acc) throw new UnauthorizedException(`Invalid account: ${accountId}`);
    return acc;
  }
}
