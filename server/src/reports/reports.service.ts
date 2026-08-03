import { Injectable } from '@nestjs/common';
import { AnimalBreedingStatus, BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { ConceptionReportQueryDto } from './dto/conception-report-query.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';

export interface SireBreakdown {
  sireId: string;
  sireName: string;
  species: string;
  quantityTotal: number;
  quantityAvailable: number;
  quantityUsed: number;
}

export interface LowStockBatch {
  id: string;
  batchNumber: string;
  sireName: string;
  quantityAvailable: number;
  quantityTotal: number;
}

export interface TechnicianPerformance {
  technicianId: string;
  name: string;
  assigned: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  avgCompletionHours: number | null;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  async inventory(): Promise<{
    totalBatches: number;
    totalQuantityTotal: number;
    totalQuantityAvailable: number;
    totalQuantityUsed: number;
    bySire: SireBreakdown[];
    lowStock: LowStockBatch[];
  }> {
    const [batches, { lowStockThreshold }] = await Promise.all([
      this.prisma.batch.findMany({
        include: { sire: { select: { id: true, name: true, species: true } } },
      }),
      this.settings.get(),
    ]);

    const bySireMap = new Map<string, SireBreakdown>();
    let totalQuantityTotal = 0;
    let totalQuantityAvailable = 0;

    for (const batch of batches) {
      totalQuantityTotal += batch.quantityTotal;
      totalQuantityAvailable += batch.quantityAvailable;
      const entry = bySireMap.get(batch.sireId) ?? {
        sireId: batch.sireId,
        sireName: batch.sire.name,
        species: batch.sire.species,
        quantityTotal: 0,
        quantityAvailable: 0,
        quantityUsed: 0,
      };
      entry.quantityTotal += batch.quantityTotal;
      entry.quantityAvailable += batch.quantityAvailable;
      entry.quantityUsed = entry.quantityTotal - entry.quantityAvailable;
      bySireMap.set(batch.sireId, entry);
    }

    const lowStock: LowStockBatch[] = batches
      .filter((b) => b.quantityAvailable <= lowStockThreshold)
      .map((b) => ({
        id: b.id,
        batchNumber: b.batchNumber,
        sireName: b.sire.name,
        quantityAvailable: b.quantityAvailable,
        quantityTotal: b.quantityTotal,
      }))
      .sort((a, b) => a.quantityAvailable - b.quantityAvailable);

    return {
      totalBatches: batches.length,
      totalQuantityTotal,
      totalQuantityAvailable,
      totalQuantityUsed: totalQuantityTotal - totalQuantityAvailable,
      bySire: [...bySireMap.values()],
      lowStock,
    };
  }

  async bookings(query: DateRangeQueryDto): Promise<{
    total: number;
    byStatus: Record<BookingStatus, number>;
  }> {
    const where = this.dateRangeWhere('createdAt', query);
    const grouped = await this.prisma.booking.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });
    const byStatus = Object.fromEntries(
      Object.values(BookingStatus).map((status) => [
        status,
        grouped.find((g) => g.status === status)?._count._all ?? 0,
      ]),
    ) as Record<BookingStatus, number>;
    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
    return { total, byStatus };
  }

  async technicianPerformance(
    query: DateRangeQueryDto,
  ): Promise<TechnicianPerformance[]> {
    const where: Prisma.BookingWhereInput = {
      technicianId: { not: null },
      ...this.dateRangeWhere('assignedAt', query),
    };
    const bookings = await this.prisma.booking.findMany({
      where,
      select: {
        technicianId: true,
        status: true,
        assignedAt: true,
        completedAt: true,
        technician: { select: { id: true, name: true } },
      },
    });

    const map = new Map<string, TechnicianPerformance & { totalHours: number }>();
    for (const booking of bookings) {
      const id = booking.technicianId as string;
      const entry = map.get(id) ?? {
        technicianId: id,
        name: booking.technician?.name ?? 'Unknown',
        assigned: 0,
        completed: 0,
        cancelled: 0,
        completionRate: 0,
        avgCompletionHours: null,
        totalHours: 0,
      };
      entry.assigned += 1;
      if (booking.status === BookingStatus.COMPLETED) {
        entry.completed += 1;
        if (booking.assignedAt && booking.completedAt) {
          entry.totalHours +=
            (booking.completedAt.getTime() - booking.assignedAt.getTime()) /
            (1000 * 60 * 60);
        }
      }
      if (booking.status === BookingStatus.CANCELLED) entry.cancelled += 1;
      map.set(id, entry);
    }

    return [...map.values()].map(({ totalHours, ...rest }) => ({
      ...rest,
      completionRate: rest.assigned > 0 ? rest.completed / rest.assigned : 0,
      avgCompletionHours: rest.completed > 0 ? totalHours / rest.completed : null,
    }));
  }

  async conception(query: ConceptionReportQueryDto): Promise<{
    total: number;
    byStatus: Record<AnimalBreedingStatus, number>;
  }> {
    const where: Prisma.AnimalWhereInput = {
      ...(query.species ? { species: query.species } : {}),
      ...(query.breedId ? { breedId: query.breedId } : {}),
    };
    const grouped = await this.prisma.animal.groupBy({
      by: ['breedingStatus'],
      where,
      _count: { _all: true },
    });
    const byStatus = Object.fromEntries(
      Object.values(AnimalBreedingStatus).map((status) => [
        status,
        grouped.find((g) => g.breedingStatus === status)?._count._all ?? 0,
      ]),
    ) as Record<AnimalBreedingStatus, number>;
    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
    return { total, byStatus };
  }

  private dateRangeWhere(
    field: string,
    query: DateRangeQueryDto,
  ): Record<string, { gte?: Date; lte?: Date }> {
    if (!query.from && !query.to) return {};
    return {
      [field]: {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      },
    };
  }
}
