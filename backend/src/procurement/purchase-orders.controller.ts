import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import {
  resolveBranchId,
  resolveOptionalBranchId,
} from '../auth/branch-scope.util';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { PurchaseOrderResponseDto } from './dto/procurement-response.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('purchase-orders')
@ApiCommonErrorResponses()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get()
  @ApiOperation({ summary: 'List purchase orders' })
  @ApiOkResponse({
    type: PurchaseOrderResponseDto,
    isArray: true,
    description: 'Purchase orders retrieved',
  })
  findAll(@Req() req: RequestWithUser) {
    const branchId = resolveOptionalBranchId(req.user);
    return this.procurementService.findAllPOs(branchId);
  }

  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Post()
  @ApiOperation({ summary: 'Create purchase order' })
  @ApiOkResponse({ type: PurchaseOrderResponseDto, description: 'Purchase order created' })
  create(@Body() dto: CreatePurchaseOrderDto, @Req() req: RequestWithUser) {
    const branchId = resolveBranchId(req.user, dto.branchId);
    return this.procurementService.createPO(
      {
        branchId,
        supplierId: dto.supplierId,
        items: dto.items.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          price: i.unitPrice,
        })),
      },
      req.user.userId,
    );
  }

  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Patch(':id/submit')
  @ApiOperation({ summary: 'Submit purchase order' })
  @ApiOkResponse({ type: PurchaseOrderResponseDto, description: 'Purchase order submitted' })
  submit(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.procurementService.submitPO(id, req.user.userId, req.user);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve purchase order' })
  @ApiOkResponse({ type: PurchaseOrderResponseDto, description: 'Purchase order approved' })
  approve(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.procurementService.approvePO(id, req.user.userId, req.user);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject purchase order' })
  @ApiOkResponse({ type: PurchaseOrderResponseDto, description: 'Purchase order rejected' })
  reject(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.procurementService.rejectPO(id, req.user.userId, req.user);
  }

  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive purchase order' })
  @ApiOkResponse({ type: PurchaseOrderResponseDto, description: 'Purchase order received' })
  receive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReceivePurchaseOrderDto,
    @Req() req: RequestWithUser,
  ) {
    const expiryDates = dto.items
      ?.filter((i) => i.expiryDate)
      .map((i) => ({
        ingredientId: i.ingredientId,
        date: i.expiryDate!,
      }));
    return this.procurementService.receivePO(
      id,
      req.user.userId,
      expiryDates,
      req.user,
    );
  }
}
