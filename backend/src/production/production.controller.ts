import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import {
  resolveBranchId,
  resolveOptionalBranchId,
} from '../auth/branch-scope.util';
import {
  CreateBomDto,
  CreateProductionOrderDto,
  UpdateProductionStatusDto,
} from './dto/production.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('production')
@ApiCommonErrorResponses()
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('orders')
  @ApiOperation({ summary: 'List production orders' })
  @ApiOkResponse({ description: 'Production orders retrieved' })
  getProductionOrders(@Req() req: RequestWithUser) {
    const branchId = resolveOptionalBranchId(req.user);
    return this.productionService.getProductionOrders(branchId);
  }

  @Get('boms')
  @ApiOperation({ summary: 'List production BOMs' })
  @ApiOkResponse({ description: 'BOMs retrieved' })
  getBOMs() {
    return this.productionService.getBOMs();
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('orders')
  @ApiOperation({ summary: 'Create production order' })
  @ApiOkResponse({ description: 'Production order created' })
  createOrder(
    @Req() req: RequestWithUser,
    @Body() dto: CreateProductionOrderDto,
  ) {
    const branchId = resolveBranchId(req.user, dto.branchId);
    return this.productionService.createProductionOrder({
      branchId,
      targetIngredientId: dto.targetIngredientId,
      quantityToProduce: dto.quantityToProduce,
      plannedStartDate: dto.plannedStartDate
        ? new Date(dto.plannedStartDate)
        : undefined,
    });
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update production order status' })
  @ApiOkResponse({ description: 'Production order status updated' })
  updateOrderStatus(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductionStatusDto,
  ) {
    return this.productionService.updateOrderStatus(id, dto.status, req.user);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch('orders/:id/complete')
  @ApiOperation({ summary: 'Complete production order' })
  @ApiOkResponse({ description: 'Production order completed' })
  completeOrder(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    return this.productionService.completeProductionOrder(
      id,
      req.user?.userId,
      req.user,
    );
  }

  @Roles('SUPER_ADMIN')
  @Post('boms')
  @ApiOperation({ summary: 'Create production BOM' })
  @ApiOkResponse({ description: 'BOM created' })
  createBOM(@Body() dto: CreateBomDto) {
    return this.productionService.createBOM(dto);
  }
}
