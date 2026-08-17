import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SpeciesService } from './species.service';
import { SpeciesController } from './species.controller';

@Module({
  imports: [AuthModule],
  controllers: [SpeciesController],
  providers: [SpeciesService],
  exports: [SpeciesService],
})
export class SpeciesModule {}
