import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatBotModule } from './chat-bot/chat-bot.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [AuthModule, ChatBotModule, FeedbackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
