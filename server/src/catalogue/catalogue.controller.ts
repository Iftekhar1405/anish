import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CatalogueService } from './catalogue.service';
import { CreateSireDto } from './dto/create-sire.dto';
import { UpdateSireDto } from './dto/update-sire.dto';
import { ListSiresQueryDto } from './dto/list-sires-query.dto';

/** Farmers browse the catalogue (read-only); only Admin manages it. */
@Controller('catalogue/sires')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.FARMER)
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueService) {}

  @Get()
  list(@Query() query: ListSiresQueryDto) {
    return this.catalogue.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogue.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSireDto) {
    return this.catalogue.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSireDto) {
    return this.catalogue.update(id, dto);
  }
}
