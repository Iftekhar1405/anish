import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { BookingsService } from './bookings.service';
import { AssignBookingDto } from './dto/assign-booking.dto';
import { CompleteBookingDto } from './dto/complete-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.FARMER, Role.TECHNICIAN)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  list(@Query() query: ListBookingsQueryDto, @CurrentUser() user: JwtPayload) {
    return this.bookings.list(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.bookings.findOne(id, user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.FARMER)
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: JwtPayload) {
    return this.bookings.create(dto, user);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  assign(@Param('id') id: string, @Body() dto: AssignBookingDto) {
    return this.bookings.assign(id, dto);
  }

  @Patch(':id/start')
  @Roles(Role.TECHNICIAN)
  start(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.bookings.start(id, user);
  }

  @Patch(':id/complete')
  @Roles(Role.TECHNICIAN)
  complete(
    @Param('id') id: string,
    @Body() dto: CompleteBookingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.bookings.complete(id, dto, user);
  }
}
