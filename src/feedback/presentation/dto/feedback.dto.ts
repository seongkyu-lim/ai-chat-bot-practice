import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import type { FeedbackStatus } from '../../domain/entity/feedback.entity';

export class CreateFeedbackReqDto {
  @IsUUID()
  chatId: string;

  @IsBoolean()
  isPositive: boolean;
}

export class UpdateFeedbackStatusReqDto {
  @IsEnum(['pending', 'resolved'])
  status: FeedbackStatus;
}

export class ListFeedbackQueryDto {
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';

  @IsOptional()
  isPositive?: boolean;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class FeedbackResDto {
  id: string;
  authorId: string;
  chatId: string;
  isPositive: boolean;
  status: FeedbackStatus;
  createdAt: Date;

  static of(entity: any): FeedbackResDto {
    return {
      id: entity.id,
      authorId: entity.author?.id,
      chatId: entity.chat?.id,
      isPositive: entity.isPositive,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
