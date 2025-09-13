import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from '../service/feedback.service';
import { AuthGuard } from '../../common/jwt/jwt-auth.guard';
import type { Request } from 'express';
import { Req } from '@nestjs/common';
import { CreateFeedbackReqDto, FeedbackResDto } from './dto/feedback.dto';
import { AuthService } from '../../auth/application/service/auth.service';
import type { FeedbackStatus } from '../domain/entity/feedback.entity';

@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Req() req: Request,
    @Body() body: CreateFeedbackReqDto,
  ): Promise<FeedbackResDto> {
    const accountId = (req as any).user?.sub as string;
    const role = await this.authService.getAccountRole(accountId);
    const saved = await this.feedbackService.create(
      accountId,
      role,
      body.chatId,
      body.isPositive,
    );
    return FeedbackResDto.of(saved);
  }

  @UseGuards(AuthGuard)
  @Get('list')
  async list(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('order') order: 'ASC' | 'DESC' = 'DESC',
    @Query('isPositive') isPositive?: string,
  ) {
    const accountId = (req as any).user?.sub as string;
    const role = await this.authService.getAccountRole(accountId);
    const filterPos =
      typeof isPositive === 'string' ? isPositive === 'true' : undefined;
    return this.feedbackService.list(
      accountId,
      role,
      page,
      limit,
      order,
      filterPos,
    );
  }

  @UseGuards(AuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('status') status: FeedbackStatus,
  ) {
    const accountId = (req as any).user?.sub as string;
    const role = await this.authService.getAccountRole(accountId);
    return this.feedbackService.updateStatus(role, id, status);
  }
}
