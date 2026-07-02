import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreatePromotionDto,
  TogglePromotionDto,
  UpdatePromotionDto,
  ValidatePromotionDto,
} from './dto/promotion.dto';
import {
  PromotionResponseDto,
  ValidatePromotionResponseDto,
} from './dto/promotion-response.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('promotions')
@ApiCommonErrorResponses()
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post()
  @ApiOperation({ summary: 'Create promotion' })
  @ApiOkResponse({
    type: PromotionResponseDto,
    description: 'Promotion created',
  })
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List promotions' })
  @ApiOkResponse({
    type: PromotionResponseDto,
    isArray: true,
    description: 'Promotions retrieved',
  })
  findAll() {
    return this.promotionsService.findAll();
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch(':id')
  @ApiOperation({ summary: 'Update promotion' })
  @ApiOkResponse({
    type: PromotionResponseDto,
    description: 'Promotion updated',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete promotion' })
  @ApiOkResponse({
    type: PromotionResponseDto,
    description: 'Promotion deleted',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promotionsService.remove(id);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle promotion active state' })
  @ApiOkResponse({
    type: PromotionResponseDto,
    description: 'Promotion state updated',
  })
  toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TogglePromotionDto,
  ) {
    return this.promotionsService.toggleActive(id, dto.isActive);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate promotion code' })
  @ApiOkResponse({
    type: ValidatePromotionResponseDto,
    description: 'Promotion validation result',
  })
  validateCode(@Body() dto: ValidatePromotionDto) {
    return this.promotionsService.validateCode(dto.code, dto.subtotal);
  }
}
