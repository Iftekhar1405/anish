import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ServiceAreasService } from './service-areas.service';
import { ServiceAreasController } from './service-areas.controller';

@Module({
  imports: [AuthModule],
  controllers: [ServiceAreasController],
  providers: [ServiceAreasService],
})
export class ServiceAreasModule {}
