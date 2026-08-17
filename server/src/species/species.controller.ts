import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { ListSpeciesQueryDto } from './dto/list-species-query.dto';

/**
 * Every role reads the species list (it drives the pickers in all three apps);
 * only Admin maintains it.
 */
@Controller('species')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.FARMER, Role.TECHNICIAN)
export class SpeciesController {
  constructor(private readonly species: SpeciesService) {}

  @Get()
  list(@Query() query: ListSpeciesQueryDto) {
    return this.species.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.species.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSpeciesDto) {
    return this.species.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSpeciesDto) {
    return this.species.update(id, dto);
  }
}
