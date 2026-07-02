import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IngredientsService } from './ingredients.service';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { resolveBranchId } from '../auth/branch-scope.util';
import { CreateIngredientDto, UpdateIngredientDto } from './dto/ingredient.dto';
import { parseOptionalPositiveInt } from '../common/query-params.util';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';
import { WasteLogResponseDto } from '../inventory/dto/inventory-response.dto';
import {
  BranchInventoryWithIngredientResponseDto,
  IngredientResponseDto,
  SyncIngredientInventoryResponseDto,
} from './dto/ingredient-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('ingredients')
@ApiCommonErrorResponses()
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get('inventory/branch')
  @ApiOperation({ summary: 'Get branch ingredient inventory' })
  @ApiOkResponse({
    type: BranchInventoryWithIngredientResponseDto,
    isArray: true,
    description: 'Inventory retrieved',
  })
  getBranchInventory(
    @Request() req: RequestWithUser,
    @Query('branchId') branchIdQuery?: string,
  ) {
    const branchId = resolveBranchId(
      req.user,
      parseOptionalPositiveInt(branchIdQuery, 'branchId'),
    );
    return this.ingredientsService.getBranchInventory(branchId);
  }

  @Get('waste/logs')
  @ApiOperation({ summary: 'Get ingredient waste logs' })
  @ApiOkResponse({
    type: WasteLogResponseDto,
    isArray: true,
    description: 'Waste logs retrieved',
  })
  getWasteLogs(
    @Request() req: RequestWithUser,
    @Query('branchId') branchIdQuery?: string,
  ) {
    const branchId = resolveBranchId(
      req.user,
      parseOptionalPositiveInt(branchIdQuery, 'branchId'),
    );
    return this.ingredientsService.getWasteLogs(branchId);
  }

  @Get()
  @ApiOperation({ summary: 'List ingredients' })
  @ApiOkResponse({
    type: IngredientResponseDto,
    isArray: true,
    description: 'Ingredients retrieved',
  })
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post()
  @ApiOperation({ summary: 'Create ingredient' })
  @ApiOkResponse({
    type: IngredientResponseDto,
    description: 'Ingredient created',
  })
  create(@Body() dto: CreateIngredientDto) {
    return this.ingredientsService.create(dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post(':id/sync-inventory')
  @ApiOperation({ summary: 'Sync ingredient inventory for all branches' })
  @ApiOkResponse({
    type: SyncIngredientInventoryResponseDto,
    description: 'Ingredient inventory synchronized',
  })
  syncBranchInventory(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.syncBranchInventory(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ingredient by id' })
  @ApiOkResponse({
    type: IngredientResponseDto,
    description: 'Ingredient retrieved',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch(':id')
  @ApiOperation({ summary: 'Update ingredient' })
  @ApiOkResponse({
    type: IngredientResponseDto,
    description: 'Ingredient updated',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete ingredient' })
  @ApiOkResponse({
    type: IngredientResponseDto,
    description: 'Ingredient deleted',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.remove(id);
  }
}
