import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { CatalogueService } from './catalogue.service';
import { CreateSireDto } from './dto/create-sire.dto';
import { UpdateSireDto } from './dto/update-sire.dto';
import { ListSiresQueryDto } from './dto/list-sires-query.dto';

@Controller('catalogue/sires')
@AdminOnly()
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
  create(@Body() dto: CreateSireDto) {
    return this.catalogue.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSireDto) {
    return this.catalogue.update(id, dto);
  }
}
