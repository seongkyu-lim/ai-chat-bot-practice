import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBotController } from './presentation/chat-bot.controller';
import { ChatBotService } from './service/chat-bot.service';
import { Thread } from './domain/entity/thread.entity';
import { Chat } from './domain/entity/chat.entity';
import { Account } from '../auth/domain/entity/account.entity';
import { ChatCreationHistory } from './domain/entity/chat-creation-history.entity';
import { AuthService } from '../auth/application/service/auth.service';
import { LoginHistory } from '../auth/domain/entity/login-history.entity';
import { SignupHistory } from '../auth/domain/entity/signup-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Thread,
      Chat,
      Account,
      LoginHistory,
      SignupHistory,
      ChatCreationHistory,
    ]),
  ],
  controllers: [ChatBotController],
  providers: [ChatBotService, AuthService],
})
export class ChatBotModule {}
