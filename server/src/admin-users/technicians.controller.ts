import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { AdminUserSummary, PaginatedResult } from '@ai-platform/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/technicians')
export class TechniciansController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  list(@Query() query: ListAdminUsersQueryDto): Promise<PaginatedResult<AdminUserSummary>> {
    return this.adminUsersService.list(Role.TECHNICIAN, query);
  }

  @Post()
  create(@Body() dto: CreateAdminUserDto): Promise<AdminUserSummary> {
    return this.adminUsersService.create(Role.TECHNICIAN, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto): Promise<AdminUserSummary> {
    return this.adminUsersService.update(Role.TECHNICIAN, id, dto);
  }
}
