import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { CreateTechnicianDto } from './dto/create-technician.dto';

@Controller('technicians')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class TechniciansController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedResult<UserSummary>> {
    return this.users.list(Role.TECHNICIAN, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserSummary> {
    return this.users.findOne(Role.TECHNICIAN, id);
  }

  @Post()
  create(@Body() dto: CreateTechnicianDto): Promise<UserSummary> {
    return this.users.createTechnician(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserSummary> {
    return this.users.update(Role.TECHNICIAN, id, dto);
  }
}
