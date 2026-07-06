import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { resolveOptionalBranchId } from '../auth/branch-scope.util';
import { parseOptionalPositiveInt } from '../common/query-params.util';
import { ApiCommonErrorResponses } from '../common/http/swagger-error.decorators';
import {
  MarkAllReadResponseDto,
  NotificationResponseDto,
} from './dto/notification-response.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('notifications')
@ApiCommonErrorResponses()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications visible to the current user' })
  @ApiOkResponse({
    type: NotificationResponseDto,
    isArray: true,
    description: 'Notifications retrieved',
  })
  list(@Request() req: RequestWithUser, @Query('branchId') branchId?: string) {
    const resolvedBranchId = resolveOptionalBranchId(
      req.user,
      parseOptionalPositiveInt(branchId, 'branchId'),
    );
    return this.notificationsService.listForUser(req.user, resolvedBranchId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiOkResponse({
    type: NotificationResponseDto,
    description: 'Notification marked read',
  })
  markRead(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markRead(id, req.user);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all visible notifications as read' })
  @ApiOkResponse({
    type: MarkAllReadResponseDto,
    description: 'Notifications marked read',
  })
  markAllRead(
    @Request() req: RequestWithUser,
    @Query('branchId') branchId?: string,
  ) {
    const resolvedBranchId = resolveOptionalBranchId(
      req.user,
      parseOptionalPositiveInt(branchId, 'branchId'),
    );
    return this.notificationsService.markAllRead(req.user, resolvedBranchId);
  }
}
