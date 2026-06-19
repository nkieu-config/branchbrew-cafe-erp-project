import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get()
  findAll() {
    return this.procurementService.findAllPOs();
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post()
  create(@Body() data: any) {
    return this.procurementService.createPO(data);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post(':id/receive')
  receive(@Param('id', ParseIntPipe) id: number) {
    return this.procurementService.receivePO(id);
  }
}
