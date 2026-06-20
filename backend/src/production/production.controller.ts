import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, UseGuards, Req } from '@nestjs/common';
import { ProductionService } from './production.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('orders')
  getProductionOrders() {
    return this.productionService.getProductionOrders();
  }

  @Get('boms')
  getBOMs() {
    return this.productionService.getBOMs();
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('orders')
  createOrder(@Body() data: any) {
    return this.productionService.createProductionOrder(data);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch('orders/:id/complete')
  completeOrder(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.productionService.completeProductionOrder(id, req.user?.id);
  }

  @Roles('SUPER_ADMIN')
  @Post('boms')
  createBOM(@Body() data: any) {
    return this.productionService.createBOM(data);
  }
}
