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
import { SignupHistory } from '../../domain/entity/signup-history.entity';
import { LoginHistory } from '../../domain/entity/login-history.entity';
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
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
    @InjectRepository(SignupHistory)
    private readonly signupHistoryRepository: Repository<SignupHistory>,
    private readonly jwtService: JwtService,
  ) {}

  async register(requestDto: AccountRegisterReqDto): Promise<string> {
    if (
      await this.accountRepository.exists({
        where: { email: requestDto.email },
      })
    )
      throw new BadRequestException('Email already exists.');

    const saved = await this.accountRepository.save(Account.from(requestDto));
    // record signup history
    const sh = new SignupHistory();
    sh.account = saved as any;
    await this.signupHistoryRepository.save(sh);

    return 'success';
  }

  async login(requestDto: AccountLoginReqDto): Promise<AccountLoginResDto> {
    const foundAccount = await this.accountRepository.findOne({
      where: { email: requestDto.email },
    });

    if (!foundAccount) throw new UnauthorizedException('Email not found.');
    if (foundAccount.password !== requestDto.password)
      throw new UnauthorizedException('Password not match.');

    // record login history
    const lh = new LoginHistory();
    lh.account = foundAccount as any;
    await this.loginHistoryRepository.save(lh);

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
