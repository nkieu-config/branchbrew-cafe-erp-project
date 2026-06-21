import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('branch/:branchId/balance')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  getBalance(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.inventoryService.getBalance(branchId);
  }

  @Post('branch/:branchId/stock-in')
  @Roles('SUPER_ADMIN', 'MANAGER')
  receiveStock(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() data: { items: { ingredientId: number; quantity: number; expiryDate?: Date }[] }
  ) {
    return this.inventoryService.receiveStock(branchId, data);
  }

  @Post('branch/:branchId/waste')
  @Roles('SUPER_ADMIN', 'MANAGER', 'STAFF')
  recordWaste(
    @Param('branchId', ParseIntPipe) branchId: number,
    @Request() req: any,
    @Body() data: { items: { ingredientId: number; quantity: number; reason: string }[] }
  ) {
    return this.inventoryService.recordWaste(branchId, req.user.userId, data);
  }
}
