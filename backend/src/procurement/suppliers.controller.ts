import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierResponseDto } from './dto/procurement-response.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('suppliers')
@ApiCommonErrorResponses()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get()
  @ApiOperation({ summary: 'List suppliers' })
  @ApiOkResponse({
    type: SupplierResponseDto,
    isArray: true,
    description: 'Suppliers retrieved',
  })
  findAll() {
    return this.procurementService.findAllSuppliers();
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post()
  @ApiOperation({ summary: 'Create supplier' })
  @ApiOkResponse({ type: SupplierResponseDto, description: 'Supplier created' })
  create(@Body() dto: CreateSupplierDto) {
    return this.procurementService.createSupplier(dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiOkResponse({ type: SupplierResponseDto, description: 'Supplier updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.procurementService.updateSupplier(id, dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiOkResponse({ type: SupplierResponseDto, description: 'Supplier deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.procurementService.deleteSupplier(id);
  }
}
