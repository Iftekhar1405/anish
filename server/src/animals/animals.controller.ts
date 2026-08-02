import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { ListAnimalsQueryDto } from './dto/list-animals-query.dto';

@Controller('animals')
@AdminOnly()
export class AnimalsController {
  constructor(private readonly animals: AnimalsService) {}

  @Get()
  list(@Query() query: ListAnimalsQueryDto) {
    return this.animals.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.animals.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAnimalDto) {
    return this.animals.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnimalDto) {
    return this.animals.update(id, dto);
  }
}
