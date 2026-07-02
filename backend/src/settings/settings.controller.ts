import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';
import type { SettingsUpdateInput } from './settings-keys.util';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('settings')
@ApiCommonErrorResponses()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get system settings' })
  @ApiOkResponse({ description: 'Settings retrieved' })
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Roles('SUPER_ADMIN')
  @Post()
  @ApiOperation({ summary: 'Update system settings' })
  @ApiOkResponse({ description: 'Settings updated' })
  updateSettings(
    @Request() req: RequestWithUser,
    @Body() data: SettingsUpdateInput,
  ) {
    return this.settingsService.updateSettings(data, req.user.userId);
  }
}
