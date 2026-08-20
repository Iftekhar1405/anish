import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

/** Farmer self-service: address/district so a technician can find them. */
@Controller('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.FARMER)
export class ProfileController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.users.findOwnProfile(user.sub);
  }

  @Patch('me')
  update(@Body() dto: UpdateProfileDto, @CurrentUser() user: JwtPayload) {
    return this.users.updateOwnProfile(user.sub, dto);
  }

  /**
   * Farmer-initiated account deletion — required by Google Play for any app
   * that offers in-app registration. Anonymises the account and ends every
   * session; the service history the operator must keep is retained without
   * the farmer's identity attached to it.
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.users.deleteOwnAccount(user.sub);
  }
}
