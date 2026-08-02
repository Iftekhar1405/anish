import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { BreedsService } from './breeds.service';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { ListBreedsQueryDto } from './dto/list-breeds-query.dto';

@Controller('breeds')
@AdminOnly()
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
  create(@Body() dto: CreateBreedDto) {
    return this.breeds.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBreedDto) {
    return this.breeds.update(id, dto);
  }
}
