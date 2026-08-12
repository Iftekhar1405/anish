import type { AnimalBreedingStatus, Species } from "./masters";
import type { BookingStatus } from "./bookings";

export interface DateRangeQuery {
  from?: string;
  to?: string;
}

export interface SireBreakdown {
  sireId: string;
  sireName: string;
  species: Species;
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

export interface InventoryReport {
  totalBatches: number;
  totalQuantityTotal: number;
  totalQuantityAvailable: number;
  totalQuantityUsed: number;
  bySire: SireBreakdown[];
  lowStock: LowStockBatch[];
}

export interface BookingsReport {
  total: number;
  byStatus: Record<BookingStatus, number>;
}

export interface TechnicianPerformanceEntry {
  technicianId: string;
  name: string;
  assigned: number;
  completed: number;
  cancelled: number;
  completionRate: number;
  avgCompletionHours: number | null;
}

export interface ConceptionReportQuery {
  species?: Species;
  breedId?: string;
}

export interface ConceptionReport {
  total: number;
  byStatus: Record<AnimalBreedingStatus, number>;
}
