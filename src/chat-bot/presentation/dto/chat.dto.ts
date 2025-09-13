import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateChatReqDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsBoolean()
  isStreaming?: boolean;

  @IsOptional()
  @IsString()
  model?: string;
}

export class ChatResDto {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;

  static of(entity: {
    id: string;
    question: string;
    answer: string;
    createdAt: Date;
  }): ChatResDto {
    return {
      id: entity.id,
      question: entity.question,
      answer: entity.answer,
      createdAt: entity.createdAt,
    };
  }
}

export class ThreadWithChatsResDto {
  threadId: string;
  createdAt: Date;
  lastActivityAt: Date;
  chats: ChatResDto[];
}
