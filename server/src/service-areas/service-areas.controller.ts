import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { ServiceAreasService } from './service-areas.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { ListServiceAreasQueryDto } from './dto/list-service-areas-query.dto';

@Controller('service-areas')
@AdminOnly()
export class ServiceAreasController {
  constructor(private readonly serviceAreas: ServiceAreasService) {}

  @Get()
  list(@Query() query: ListServiceAreasQueryDto) {
    return this.serviceAreas.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceAreas.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServiceAreaDto) {
    return this.serviceAreas.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceAreaDto) {
    return this.serviceAreas.update(id, dto);
  }
}
