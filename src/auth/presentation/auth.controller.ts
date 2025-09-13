import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { AuthUseCase } from '../application/use-case/auth.use-case';
import { AccountLoginReqDto, AccountRegisterReqDto } from './dto/request.dto';
import { AUTH_USE_CASE } from './symbol';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_USE_CASE)
    private readonly authService: AuthUseCase,
  ) {}

  @Post('/register')
  async register(@Body() requestDto: AccountRegisterReqDto) {
    return await this.authService.register(requestDto);
  }

  @Post('/login')
  async login(@Body() requestDto: AccountLoginReqDto) {
    return await this.authService.login(requestDto);
  }
}
