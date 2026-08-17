import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SpeciesModule } from '../species/species.module';
import { BreedsService } from './breeds.service';
import { BreedsController } from './breeds.controller';

@Module({
  imports: [AuthModule, SpeciesModule],
  controllers: [BreedsController],
  providers: [BreedsService],
})
export class BreedsModule {}
