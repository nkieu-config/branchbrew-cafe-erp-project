import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get()
  findAll() {
    return this.procurementService.findAllPOs();
  }

  @Post()
  create(@Body() data: any) {
    return this.procurementService.createPO(data);
  }

  @Post(':id/receive')
  receive(@Param('id', ParseIntPipe) id: number) {
    return this.procurementService.receivePO(id);
  }
}
