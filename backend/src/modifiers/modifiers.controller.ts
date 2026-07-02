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
import {
  ModifierDeleteResponseDto,
  ModifierGroupResponseDto,
  ModifierOptionResponseDto,
} from './dto/modifier-response.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('modifiers')
@ApiCommonErrorResponses()
@Controller('modifiers')
export class ModifiersController {
  constructor(private readonly modifiersService: ModifiersService) {}

  @Get()
  @ApiOperation({ summary: 'List modifier groups and options' })
  @ApiOkResponse({
    type: ModifierGroupResponseDto,
    isArray: true,
    description: 'Modifiers retrieved',
  })
  findAll(@Query('category') category?: string) {
    return this.modifiersService.findAll(category);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('groups')
  @ApiOperation({ summary: 'Create modifier group' })
  @ApiOkResponse({ type: ModifierGroupResponseDto, description: 'Modifier group created' })
  createGroup(@Body() dto: CreateModifierGroupDto) {
    return this.modifiersService.createGroup(dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch('groups/:id')
  @ApiOperation({ summary: 'Update modifier group' })
  @ApiOkResponse({ type: ModifierGroupResponseDto, description: 'Modifier group updated' })
  updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModifierGroupDto,
  ) {
    return this.modifiersService.updateGroup(id, dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Delete('groups/:id')
  @ApiOperation({ summary: 'Delete modifier group' })
  @ApiOkResponse({ type: ModifierDeleteResponseDto, description: 'Modifier group deleted' })
  deleteGroup(@Param('id', ParseIntPipe) id: number) {
    return this.modifiersService.deleteGroup(id);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Post('options')
  @ApiOperation({ summary: 'Create modifier option' })
  @ApiOkResponse({ type: ModifierOptionResponseDto, description: 'Modifier option created' })
  createOption(@Body() dto: CreateModifierOptionForGroupDto) {
    return this.modifiersService.createOption(dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Patch('options/:id')
  @ApiOperation({ summary: 'Update modifier option' })
  @ApiOkResponse({ type: ModifierOptionResponseDto, description: 'Modifier option updated' })
  updateOption(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModifierOptionDto,
  ) {
    return this.modifiersService.updateOption(id, dto);
  }

  @Roles('SUPER_ADMIN', 'MANAGER')
  @Delete('options/:id')
  @ApiOperation({ summary: 'Delete modifier option' })
  @ApiOkResponse({ type: ModifierDeleteResponseDto, description: 'Modifier option deleted' })
  deleteOption(@Param('id', ParseIntPipe) id: number) {
    return this.modifiersService.deleteOption(id);
  }
}
