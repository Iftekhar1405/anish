import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BreedsService } from './breeds.service';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { ListBreedsQueryDto } from './dto/list-breeds-query.dto';

/** Farmers read breeds (to tag their animals); only Admin manages the list. */
@Controller('breeds')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.FARMER)
export class BreedsController {
  constructor(private readonly breeds: BreedsService) {}

  @Get()
  list(@Query() query: ListBreedsQueryDto) {
    return this.breeds.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.breeds.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateBreedDto) {
    return this.breeds.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateBreedDto) {
    return this.breeds.update(id, dto);
  }
}
