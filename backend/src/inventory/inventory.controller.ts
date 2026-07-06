import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { StockCountService } from './stock-count.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { assertBranchAccess } from '../auth/branch-scope.util';
import { RecordWasteDto, StockInDto } from './dto/inventory.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';
import {
  BranchInventoryResponseDto,
  StockInResultDto,
  WasteLogResponseDto,
} from './dto/inventory-response.dto';
import {
  CreateStockCountDto,
  ManualAdjustmentDto,
  UpdateStockCountLinesDto,
} from './dto/stock-count.dto';
import {
  StockAdjustmentResponseDto,
  StockCountResponseDto,
} from './dto/stock-count-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('inventory')
@ApiCommonErrorResponses()
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly stockCountService: StockCountService,
  ) {}

  @Get('branch/:branchId/balance')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Get inventory balance by branch' })
  @ApiOkResponse({
    type: BranchInventoryResponseDto,
    isArray: true,
    description: 'Inventory balance retrieved',
  })
  getBalance(
    @Request() req: RequestWithUser,
    @Param('branchId', ParseIntPipe) branchId: number,
  ) {
    assertBranchAccess(req.user, branchId);
    return this.inventoryService.getBalance(branchId);
  }

  @Post('branch/:branchId/stock-in')
  @Roles('SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Receive stock into branch inventory' })
  @ApiOkResponse({
    type: StockInResultDto,
    isArray: true,
    description: 'Stock received',
  })
  receiveStock(
    @Request() req: RequestWithUser,
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: StockInDto,
  ) {
    assertBranchAccess(req.user, branchId);
    return this.inventoryService.receiveStock(branchId, {
      items: dto.items.map((item) => ({
        ...item,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
      })),
    });
  }

  @Post('branch/:branchId/waste')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Record inventory waste' })
  @ApiOkResponse({
    type: WasteLogResponseDto,
    isArray: true,
    description: 'Waste recorded',
  })
  recordWaste(
    @Request() req: RequestWithUser,
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: RecordWasteDto,
  ) {
    assertBranchAccess(req.user, branchId);
    return this.inventoryService.recordWaste(branchId, req.user.userId, dto);
  }

  @Post('branch/:branchId/stock-counts')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Start a stock count for a branch' })
  @ApiOkResponse({
    type: StockCountResponseDto,
    description: 'Stock count created',
  })
  createStockCount(
    @Request() req: RequestWithUser,
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: CreateStockCountDto,
  ) {
    assertBranchAccess(req.user, branchId);
    return this.stockCountService.createStockCount(branchId, req.user, dto);
  }

  @Get('branch/:branchId/stock-counts')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'List stock counts for a branch' })
  @ApiOkResponse({
    type: StockCountResponseDto,
    isArray: true,
    description: 'Stock counts retrieved',
  })
  listStockCounts(
    @Request() req: RequestWithUser,
    @Param('branchId', ParseIntPipe) branchId: number,
  ) {
    assertBranchAccess(req.user, branchId);
    return this.stockCountService.getStockCounts(branchId);
  }

  @Get('stock-counts/:id')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Get a stock count with its lines' })
  @ApiOkResponse({
    type: StockCountResponseDto,
    description: 'Stock count retrieved',
  })
  getStockCount(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.stockCountService.getStockCount(id, req.user);
  }

  @Patch('stock-counts/:id/lines')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Save counted quantities on a draft stock count' })
  @ApiOkResponse({
    type: StockCountResponseDto,
    description: 'Counted quantities saved',
  })
  updateStockCountLines(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockCountLinesDto,
  ) {
    return this.stockCountService.updateLines(id, req.user, dto);
  }

  @Post('stock-counts/:id/submit')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({
    summary: 'Submit a stock count for approval (snapshots expected stock)',
  })
  @ApiOkResponse({
    type: StockCountResponseDto,
    description: 'Stock count submitted',
  })
  submitStockCount(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.stockCountService.submit(id, req.user);
  }

  @Post('stock-counts/:id/approve')
  @Roles('SUPER_ADMIN', 'MANAGER')
  @ApiOperation({
    summary: 'Approve a stock count and apply variance adjustments',
  })
  @ApiOkResponse({
    type: StockCountResponseDto,
    description: 'Stock count approved',
  })
  approveStockCount(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.stockCountService.approve(id, req.user);
  }

  @Post('stock-counts/:id/cancel')
  @Roles('SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Cancel an open stock count' })
  @ApiOkResponse({
    type: StockCountResponseDto,
    description: 'Stock count cancelled',
  })
  cancelStockCount(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.stockCountService.cancel(id, req.user);
  }

  @Post('branch/:branchId/adjustments')
  @Roles('SUPER_ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Record a manual stock adjustment' })
  @ApiOkResponse({
    type: StockAdjustmentResponseDto,
    description: 'Adjustment recorded',
  })
  createAdjustment(
    @Request() req: RequestWithUser,
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() dto: ManualAdjustmentDto,
  ) {
    assertBranchAccess(req.user, branchId);
    return this.stockCountService.createManualAdjustment(
      branchId,
      req.user,
      dto,
    );
  }

  @Get('branch/:branchId/adjustments')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'List stock adjustments for a branch' })
  @ApiOkResponse({
    type: StockAdjustmentResponseDto,
    isArray: true,
    description: 'Adjustments retrieved',
  })
  listAdjustments(
    @Request() req: RequestWithUser,
    @Param('branchId', ParseIntPipe) branchId: number,
  ) {
    assertBranchAccess(req.user, branchId);
    return this.stockCountService.getAdjustments(branchId);
  }
}
