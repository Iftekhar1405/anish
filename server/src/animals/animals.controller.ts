import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { ListAnimalsQueryDto } from './dto/list-animals-query.dto';

/** Admin manages any farmer's animals; a Farmer manages only their own. */
@Controller('animals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.FARMER)
export class AnimalsController {
  constructor(private readonly animals: AnimalsService) {}

  @Get()
  list(@Query() query: ListAnimalsQueryDto, @CurrentUser() user: JwtPayload) {
    return this.animals.list(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.animals.findOne(id, user);
  }

  @Get(':id/breeding-history')
  breedingHistory(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.animals.listBreedingHistory(id, user);
  }

  @Post()
  create(@Body() dto: CreateAnimalDto, @CurrentUser() user: JwtPayload) {
    return this.animals.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAnimalDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.animals.update(id, dto, user);
  }
}
