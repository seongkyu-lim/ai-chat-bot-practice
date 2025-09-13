import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/service/auth.service';
import { JwtAuthModule } from '../common/jwt/jwt-auth.module';
import { AUTH_USE_CASE } from './presentation/symbol';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './domain/entity/account.entity';

@Module({
  imports: [
    JwtAuthModule,
    TypeOrmModule.forFeature([Account]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: +(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? '',
      database: process.env.DB_NAME ?? 'app',
      autoLoadEntities: true,
      synchronize: true,
    }),
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
