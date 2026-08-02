import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BreedsService } from './breeds.service';
import { BreedsController } from './breeds.controller';

@Module({
  imports: [AuthModule],
  controllers: [BreedsController],
  providers: [BreedsService],
})
export class BreedsModule {}
