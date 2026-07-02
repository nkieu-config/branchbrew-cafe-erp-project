import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { resolveBranchId } from '../auth/branch-scope.util';
import {
  parseOptionalNonNegativeInt,
  parseOptionalPositiveInt,
} from '../common/query-params.util';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';
import { AuditLogResponseDto } from './dto/audit-response.dto';

@ApiTags('audit')
@ApiCommonErrorResponses()
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List audit logs' })
  @ApiOkResponse({
    type: AuditLogResponseDto,
    isArray: true,
    description: 'Audit logs retrieved',
  })
  async getLogs(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const take = Math.min(parseOptionalPositiveInt(limit, 'limit') ?? 100, 500);
    const skip = parseOptionalNonNegativeInt(offset, 'offset') ?? 0;
    const branchId =
      req.user.role === 'SUPER_ADMIN' ? undefined : resolveBranchId(req.user);
    return this.auditService.getLogs(take, skip, branchId);
  }
}
