import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/** Protects a route/controller so only authenticated ADMINs may access it. */
export function AdminOnly() {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(Role.ADMIN));
}
