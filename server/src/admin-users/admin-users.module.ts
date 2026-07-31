import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminUsersService } from './admin-users.service';
import { FarmersController } from './farmers.controller';
import { TechniciansController } from './technicians.controller';

@Module({
  imports: [AuthModule],
  controllers: [FarmersController, TechniciansController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
