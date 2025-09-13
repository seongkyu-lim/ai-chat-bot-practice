import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './presentation/admin.controller';
import { AdminService } from './service/admin.service';
import { SignupHistory } from '../auth/domain/entity/signup-history.entity';
import { LoginHistory } from '../auth/domain/entity/login-history.entity';
import { ChatCreationHistory } from '../chat-bot/domain/entity/chat-creation-history.entity';
import { Chat } from '../chat-bot/domain/entity/chat.entity';
import { Thread } from '../chat-bot/domain/entity/thread.entity';
import { Account } from '../auth/domain/entity/account.entity';
import { AuthService } from '../auth/application/service/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SignupHistory,
      LoginHistory,
      ChatCreationHistory,
      Chat,
      Thread,
      Account,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AuthService],
})
export class AdminModule {}
