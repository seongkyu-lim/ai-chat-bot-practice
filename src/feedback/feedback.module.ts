import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './domain/entity/feedback.entity';
import { FeedbackService } from './service/feedback.service';
import { FeedbackController } from './presentation/feedback.controller';
import { Chat } from '../chat-bot/domain/entity/chat.entity';
import { Account } from '../auth/domain/entity/account.entity';
import { AuthService } from '../auth/application/service/auth.service';
import { LoginHistory } from '../auth/domain/entity/login-history.entity';
import { SignupHistory } from '../auth/domain/entity/signup-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feedback,
      Chat,
      Account,
      LoginHistory,
      SignupHistory,
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, AuthService],
})
export class FeedbackModule {}
