import { Controller, Get, Query } from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { ConceptionReportQueryDto } from './dto/conception-report-query.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@AdminOnly()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('inventory')
  inventory() {
    return this.reports.inventory();
  }

  @Get('bookings')
  bookings(@Query() query: DateRangeQueryDto) {
    return this.reports.bookings(query);
  }

  @Get('technicians')
  technicians(@Query() query: DateRangeQueryDto) {
    return this.reports.technicianPerformance(query);
  }

  @Get('conception')
  conception(@Query() query: ConceptionReportQueryDto) {
    return this.reports.conception(query);
  }
}
