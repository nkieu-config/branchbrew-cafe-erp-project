import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ModifiersService } from './modifiers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateModifierGroupDto,
  CreateModifierOptionForGroupDto,
  UpdateModifierGroupDto,
  UpdateModifierOptionDto,
} from './dto/modifier.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modifiers')
export class ModifiersController {
  constructor(private readonly modifiersService: ModifiersService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.modifiersService.findAll(category);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('groups')
  createGroup(@Body() dto: CreateModifierGroupDto) {
    return this.modifiersService.createGroup(dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch('groups/:id')
  updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModifierGroupDto,
  ) {
    return this.modifiersService.updateGroup(id, dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Delete('groups/:id')
  deleteGroup(@Param('id', ParseIntPipe) id: number) {
    return this.modifiersService.deleteGroup(id);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('options')
  createOption(@Body() dto: CreateModifierOptionForGroupDto) {
    return this.modifiersService.createOption(dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch('options/:id')
  updateOption(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModifierOptionDto,
  ) {
    return this.modifiersService.updateOption(id, dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Delete('options/:id')
  deleteOption(@Param('id', ParseIntPipe) id: number) {
    return this.modifiersService.deleteOption(id);
  }
}
