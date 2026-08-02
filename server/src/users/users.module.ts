import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersService } from './users.service';
import { FarmersController } from './farmers.controller';
import { TechniciansController } from './technicians.controller';

@Module({
  imports: [AuthModule],
  controllers: [FarmersController, TechniciansController],
  providers: [UsersService],
})
export class UsersModule {}
