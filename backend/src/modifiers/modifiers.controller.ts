import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ModifiersService } from './modifiers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('modifiers')
export class ModifiersController {
  constructor(private readonly modifiersService: ModifiersService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.modifiersService.findAll(category);
  }
}
