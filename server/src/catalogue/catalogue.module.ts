import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SpeciesModule } from '../species/species.module';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';

@Module({
  imports: [AuthModule, SpeciesModule],
  controllers: [CatalogueController],
  providers: [CatalogueService],
})
export class CatalogueModule {}
