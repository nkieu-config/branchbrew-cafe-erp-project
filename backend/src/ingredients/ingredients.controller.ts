import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IngredientsService } from './ingredients.service';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  create(@Body() createIngredientDto: { name: string; unit: string; stock?: number; minStock?: number }) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIngredientDto: any) {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('inventory/branch')
  getBranchInventory(@Request() req: any) {
    const branchId = req.user.branchId || 1; // Fallback to 1 for admin testing
    return this.ingredientsService.getBranchInventory(branchId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('waste')
  recordWaste(@Body() body: { ingredientId: number; quantity: number; reason: string }, @Request() req: any) {
    const branchId = req.user.branchId || 1;
    return this.ingredientsService.recordWaste({
      branchId,
      ingredientId: body.ingredientId,
      quantity: body.quantity,
      reason: body.reason,
      recordedById: req.user.userId
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('waste/logs')
  getWasteLogs(@Request() req: any) {
    const branchId = req.user.branchId || 1;
    return this.ingredientsService.getWasteLogs(branchId);
  }
}
