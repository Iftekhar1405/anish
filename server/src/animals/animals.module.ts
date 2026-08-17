import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SpeciesModule } from '../species/species.module';
import { AnimalsService } from './animals.service';
import { AnimalsController } from './animals.controller';

@Module({
  imports: [AuthModule, SpeciesModule],
  controllers: [AnimalsController],
  providers: [AnimalsService],
})
export class AnimalsModule {}
