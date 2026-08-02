import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { ListBatchesQueryDto } from './dto/list-batches-query.dto';

@Controller('batches')
@AdminOnly()
export class BatchesController {
  constructor(private readonly batches: BatchesService) {}

  @Get()
  list(@Query() query: ListBatchesQueryDto) {
    return this.batches.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batches.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBatchDto) {
    return this.batches.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBatchDto) {
    return this.batches.update(id, dto);
  }
}
