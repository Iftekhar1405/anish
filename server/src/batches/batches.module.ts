import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';

@Module({
  imports: [AuthModule],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}
