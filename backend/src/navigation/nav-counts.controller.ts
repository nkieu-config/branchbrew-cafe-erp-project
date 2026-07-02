import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { NavCountsService } from './nav-counts.service';
import { parseOptionalPositiveInt } from '../common/query-params.util';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@Controller('nav-counts')
@UseGuards(JwtAuthGuard)
@ApiTags('navigation')
@ApiCommonErrorResponses()
export class NavCountsController {
  constructor(private readonly navCountsService: NavCountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get navigation badge counts' })
  @ApiOkResponse({ description: 'Navigation counts retrieved' })
  getNavCounts(
    @Request() req: RequestWithUser,
    @Query('branchId') branchIdQuery?: string,
  ) {
    const branchId = parseOptionalPositiveInt(branchIdQuery, 'branchId');
    return this.navCountsService.getNavCounts(req.user, branchId);
  }
}
