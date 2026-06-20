import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'MANAGER')
  async getLogs(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const take = limit ? parseInt(limit, 10) : 100;
    const skip = offset ? parseInt(offset, 10) : 0;
    return this.auditService.getLogs(take, skip);
  }
}
