import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { resolveOptionalBranchId } from '../auth/branch-scope.util';
import { parseOptionalPositiveInt } from '../common/query-params.util';
import {
  AccountResponseDto,
  JournalEntryResponseDto,
  ProfitLossMonthResponseDto,
  SeedAccountsResponseDto,
} from './dto/accounting-response.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@ApiTags('accounting')
@ApiCommonErrorResponses()
@Controller('accounting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('accounts')
  @Roles('SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List chart of accounts' })
  @ApiOkResponse({
    type: AccountResponseDto,
    isArray: true,
    description: 'Accounts retrieved',
  })
  async getAccounts() {
    return this.accountingService.getChartOfAccounts();
  }

  @Get('journal-entries')
  @Roles('SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List journal entries' })
  @ApiOkResponse({
    type: JournalEntryResponseDto,
    isArray: true,
    description: 'Journal entries retrieved',
  })
  async getJournalEntries(
    @Request() req: RequestWithUser,
    @Query('branchId') branchId?: string,
  ) {
    const resolvedBranchId = resolveOptionalBranchId(
      req.user,
      parseOptionalPositiveInt(branchId, 'branchId'),
    );
    return this.accountingService.getJournalEntries(resolvedBranchId);
  }

  @Get('profit-loss')
  @Roles('SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Get accounting profit and loss' })
  @ApiOkResponse({
    type: ProfitLossMonthResponseDto,
    isArray: true,
    description: 'Profit and loss retrieved',
  })
  async getProfitLoss(
    @Request() req: RequestWithUser,
    @Query('branchId') branchId?: string,
  ) {
    const resolvedBranchId = resolveOptionalBranchId(
      req.user,
      parseOptionalPositiveInt(branchId, 'branchId'),
    );
    return this.accountingService.getProfitLoss(resolvedBranchId);
  }

  @Post('seed')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Seed default chart of accounts' })
  @ApiOkResponse({
    type: SeedAccountsResponseDto,
    description: 'Accounts seeded',
  })
  async seedAccounts() {
    await this.accountingService.seedAccounts();
    return { success: true, message: 'Accounts seeded successfully' };
  }
}
