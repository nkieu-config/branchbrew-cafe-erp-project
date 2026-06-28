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
import {
  CreatePromotionDto,
  TogglePromotionDto,
  UpdatePromotionDto,
  ValidatePromotionDto,
} from './dto/promotion.dto';

@UseGuards(JwtAuthGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.promotionsService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promotionsService.remove(id);
  }

  @Patch(':id/toggle')
  toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TogglePromotionDto,
  ) {
    return this.promotionsService.toggleActive(id, dto.isActive);
  }

  @Post('validate')
  validateCode(@Body() dto: ValidatePromotionDto) {
    return this.promotionsService.validateCode(dto.code, dto.subtotal);
  }
}
