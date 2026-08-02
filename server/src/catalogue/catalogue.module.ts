import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CatalogueService } from './catalogue.service';
import { CatalogueController } from './catalogue.controller';

@Module({
  imports: [AuthModule],
  controllers: [CatalogueController],
  providers: [CatalogueService],
})
export class CatalogueModule {}
