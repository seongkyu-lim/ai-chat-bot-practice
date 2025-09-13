import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/service/auth.service';
import { JwtAuthModule } from '../common/jwt/jwt-auth.module';
import { AUTH_USE_CASE } from './presentation/symbol';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './domain/entity/account.entity';
import { SignupHistory } from './domain/entity/signup-history.entity';
import { LoginHistory } from './domain/entity/login-history.entity';

@Module({
  imports: [
    JwtAuthModule,
    TypeOrmModule.forFeature([Account, SignupHistory, LoginHistory]),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_USE_CASE,
      useClass: AuthService,
    },
  ],
})
export class AuthModule {}
