import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { ListDistrictsQueryDto } from './dto/list-districts-query.dto';

@Controller('districts')
@AdminOnly()
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
  create(@Body() dto: CreateDistrictDto) {
    return this.districts.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDistrictDto) {
    return this.districts.update(id, dto);
  }
}
