import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { ListDistrictsQueryDto } from './dto/list-districts-query.dto';

/** Farmers read districts (to set their own profile); only Admin manages the list. */
@Controller('districts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.FARMER)
export class DistrictsController {
  constructor(private readonly districts: DistrictsService) {}

  @Get()
  list(@Query() query: ListDistrictsQueryDto) {
    return this.districts.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.districts.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateDistrictDto) {
    return this.districts.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateDistrictDto) {
    return this.districts.update(id, dto);
  }
}
