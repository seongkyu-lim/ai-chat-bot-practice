import {
  Controller,
  Get,
  Header,
  Res,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from '../service/admin.service';
import { AuthGuard } from '../../common/jwt/jwt-auth.guard';
import type { Response, Request } from 'express';
import { AuthService } from '../../auth/application/service/auth.service';
import { AccountRole } from '../../auth/domain/enum/account-role.enum';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('activity')
  async getActivity(@Req() req: Request) {
    const accountId = (req as any).user?.sub as string;
    const role = await this.authService.getAccountRole(accountId);
    if (role !== AccountRole.ADMIN) {
      throw new ForbiddenException('Only admin can access.');
    }
    return this.adminService.getActivityCountsLast24h();
  }

  @UseGuards(AuthGuard)
  @Get('report.csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="report.csv"')
  async getReport(@Req() req: Request, @Res() res: Response) {
    const accountId = (req as any).user?.sub as string;
    const role = await this.authService.getAccountRole(accountId);
    if (role !== AccountRole.ADMIN) {
      throw new ForbiddenException('Only admin can access.');
    }
    const csv = await this.adminService.generateChatsCsvLast24h();
    res.send(csv);
  }
}
