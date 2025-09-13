import { Module } from '@nestjs/common';
import { ChatBotController } from './presentation/chat-bot.controller';
import { ChatBotService } from './service/chat-bot.service';

@Module({
  controllers: [ChatBotController],
  providers: [ChatBotService]
})
export class ChatBotModule {}
