import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Roles('SUPER_ADMIN')
  @Post()
  updateSettings(
    @Request() req: RequestWithUser,
    @Body() data: Record<string, string>,
  ) {
    return this.settingsService.updateSettings(data, req.user.userId);
  }
}
