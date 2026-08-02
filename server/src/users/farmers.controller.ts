import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  PaginatedResult,
  UserSummary,
  UsersService,
} from './users.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('farmers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class FarmersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedResult<UserSummary>> {
    return this.users.list(Role.FARMER, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserSummary> {
    return this.users.findOne(Role.FARMER, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserSummary> {
    return this.users.update(Role.FARMER, id, dto);
  }
}
