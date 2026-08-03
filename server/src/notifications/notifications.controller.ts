import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.FARMER, Role.TECHNICIAN)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('device-token')
  registerToken(@Body() dto: RegisterDeviceTokenDto, @CurrentUser() user: JwtPayload) {
    return this.notifications.registerToken(user.sub, dto.token);
  }

  @Get('me')
  listMine(@Query() query: ListNotificationsQueryDto, @CurrentUser() user: JwtPayload) {
    return this.notifications.listMine(user.sub, query);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.notifications.markRead(id, user.sub);
  }

  @Post('broadcast')
  @Roles(Role.ADMIN)
  broadcast(@Body() dto: BroadcastNotificationDto) {
    return this.notifications.broadcast(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  listAll(@Query() query: ListNotificationsQueryDto) {
    return this.notifications.listAll(query);
  }
}
