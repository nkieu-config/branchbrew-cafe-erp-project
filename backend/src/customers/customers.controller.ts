import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@ApiTags('customers')
@ApiCommonErrorResponses()
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  @ApiOkResponse({ description: 'Customer created' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List customers' })
  @ApiOkResponse({ description: 'Customers retrieved' })
  findAll(@Query('search') search?: string) {
    return this.customersService.findAll(search);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Get customer by phone' })
  @ApiOkResponse({ description: 'Customer retrieved' })
  findByPhone(@Param('phone') phone: string) {
    return this.customersService.findByPhone(phone);
  }

  @Get(':id/360')
  @ApiOperation({ summary: 'Get customer 360 view' })
  @ApiOkResponse({ description: 'Customer profile retrieved' })
  getCustomer360(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.getCustomer360(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id' })
  @ApiOkResponse({ description: 'Customer retrieved' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiOkResponse({ description: 'Customer updated' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }
}
