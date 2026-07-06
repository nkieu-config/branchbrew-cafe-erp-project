import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { NavigationService } from './navigation.service';
import { NavCountsResponseDto } from './dto/nav-counts-response.dto';
import { parseOptionalPositiveInt } from '../common/query-params.util';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@Controller('nav-counts')
@UseGuards(JwtAuthGuard)
@ApiTags('navigation')
@ApiCommonErrorResponses()
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Get navigation badge counts' })
  @ApiOkResponse({
    type: NavCountsResponseDto,
    description: 'Navigation counts retrieved',
  })
  getNavCounts(
    @Request() req: RequestWithUser,
    @Query('branchId') branchIdQuery?: string,
  ) {
    const branchId = parseOptionalPositiveInt(branchIdQuery, 'branchId');
    return this.navigationService.getNavCounts(req.user, branchId);
  }
}
