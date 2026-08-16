import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnimalBreedingStatus,
  Booking,
  BookingStatus,
  NotificationEvent,
  Prisma,
  Role,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { buildResult, PaginatedResult, paginate } from '../common/pagination';
import { AssignBookingDto } from './dto/assign-booking.dto';
import { CompleteBookingDto } from './dto/complete-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';

const bookingInclude = {
  animal: { select: { id: true, tag: true, species: true } },
  farmer: {
    select: { id: true, name: true, phone: true, address: true, district: true },
  },
  technician: { select: { id: true, name: true, phone: true } },
  batch: {
    select: {
      id: true,
      batchNumber: true,
      sire: { select: { id: true, name: true, species: true, strawPriceMinor: true } },
    },
  },
} satisfies Prisma.BookingInclude;

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(
    query: ListBookingsQueryDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedResult<Booking>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.BookingWhereInput = {
      farmerId: currentUser.role === Role.FARMER ? currentUser.sub : query.farmerId,
      technicianId:
        currentUser.role === Role.TECHNICIAN ? currentUser.sub : query.technicianId,
      ...(query.animalId ? { animalId: query.animalId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: bookingInclude,
        skip,
        take,
      }),
      this.prisma.booking.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  async findOne(id: string, currentUser: JwtPayload): Promise<Booking> {
    return this.getScopedOrThrow(id, currentUser);
  }

  async create(dto: CreateBookingDto, currentUser: JwtPayload): Promise<Booking> {
    const farmerId = this.resolveFarmerId(dto, currentUser);
    const preferredDate = this.parsePreferredDate(dto.preferredDate);

    const animal = await this.prisma.animal.findUnique({
      where: { id: dto.animalId },
    });
    if (!animal) throw new NotFoundException('Animal not found');
    if (animal.farmerId !== farmerId) {
      throw new BadRequestException('Animal does not belong to this farmer');
    }
    if (!animal.isActive) {
      throw new BadRequestException('Animal is inactive');
    }

    const batch = await this.prisma.batch.findUnique({
      where: { id: dto.batchId },
      include: { sire: true },
    });
    if (!batch) throw new NotFoundException('Batch not found');
    if (!batch.sire.isAvailable) {
      throw new BadRequestException('This sire is not currently available');
    }
    if (batch.quantityAvailable <= 0) {
      throw new BadRequestException('No straws available in this batch');
    }
    if (batch.sire.species !== animal.species) {
      throw new BadRequestException(
        "Selected straw does not match the animal's species",
      );
    }

    // Fall back to the farmer's profile address so the technician always has
    // somewhere to go, even when the farmer didn't type a per-visit location.
    const location =
      dto.location?.trim() ||
      (await this.prisma.user.findUnique({
        where: { id: farmerId },
        select: { address: true },
      }))?.address ||
      null;

    return this.prisma.booking.create({
      data: {
        animalId: dto.animalId,
        farmerId,
        batchId: dto.batchId,
        preferredDate,
        location,
        notes: dto.notes,
      },
      include: bookingInclude,
    });
  }

  /** Admin assigns a PENDING booking to an active Technician. */
  async assign(id: string, dto: AssignBookingDto): Promise<Booking> {
    const booking = await this.getOrThrow(id);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only a pending booking can be assigned');
    }
    const technician = await this.prisma.user.findUnique({
      where: { id: dto.technicianId },
      select: { role: true, isActive: true },
    });
    if (!technician) throw new NotFoundException('Technician not found');
    if (technician.role !== Role.TECHNICIAN) {
      throw new BadRequestException('Assignee must be a technician');
    }
    if (!technician.isActive) {
      throw new BadRequestException('This technician is inactive');
    }
    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.ASSIGNED,
        technicianId: dto.technicianId,
        assignedAt: new Date(),
      },
      include: bookingInclude,
    });
    const animalTag = updated.animal.tag;
    await this.notifications.notifyUser({
      userId: updated.farmerId,
      event: NotificationEvent.BOOKING_ASSIGNED,
      title: 'Technician assigned',
      body: `A technician has been assigned to your booking for ${animalTag}.`,
      bookingId: updated.id,
    });
    await this.notifications.notifyUser({
      userId: dto.technicianId,
      event: NotificationEvent.BOOKING_ASSIGNED,
      title: 'New assignment',
      body: `You've been assigned a booking for ${animalTag}.`,
      bookingId: updated.id,
    });
    return updated;
  }

  /** The assigned Technician starts the visit. */
  async start(id: string, currentUser: JwtPayload): Promise<Booking> {
    const booking = await this.getScopedOrThrow(id, currentUser);
    if (booking.status !== BookingStatus.ASSIGNED) {
      throw new BadRequestException('Only an assigned booking can be started');
    }
    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.IN_PROGRESS, startedAt: new Date() },
      include: bookingInclude,
    });
    await this.notifications.notifyUser({
      userId: updated.farmerId,
      event: NotificationEvent.BOOKING_STARTED,
      title: 'Service started',
      body: `Your technician has started the AI service for ${updated.animal.tag}.`,
      bookingId: updated.id,
    });
    return updated;
  }

  /**
   * The assigned Technician completes the visit — decrements the batch's
   * available stock atomically (guarded so it can never go negative), marks
   * the animal inseminated, and writes the breeding history entry, all in
   * the same transaction as the status change.
   */
  async complete(
    id: string,
    dto: CompleteBookingDto,
    currentUser: JwtPayload,
  ): Promise<Booking> {
    const booking = await this.getScopedOrThrow(id, currentUser);
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Only an in-progress booking can be completed');
    }
    const completedAt = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const decremented = await tx.batch.updateMany({
        where: { id: booking.batchId, quantityAvailable: { gt: 0 } },
        data: { quantityAvailable: { decrement: 1 } },
      });
      if (decremented.count === 0) {
        throw new ConflictException(
          'No straws remain in this batch to complete the booking',
        );
      }
      const result = await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.COMPLETED,
          completedAt,
          serviceNotes: dto.serviceNotes,
        },
        include: bookingInclude,
      });
      await tx.breedingHistory.create({
        data: {
          animalId: booking.animalId,
          bookingId: id,
          inseminationDate: completedAt,
          notes: dto.serviceNotes,
        },
      });
      await tx.animal.update({
        where: { id: booking.animalId },
        data: { breedingStatus: AnimalBreedingStatus.INSEMINATED },
      });
      return result;
    });
    await this.notifications.notifyUser({
      userId: updated.farmerId,
      event: NotificationEvent.BOOKING_COMPLETED,
      title: 'Service completed',
      body: `The AI service for ${updated.animal.tag} is complete.`,
      bookingId: updated.id,
    });
    return updated;
  }

  private resolveFarmerId(dto: CreateBookingDto, currentUser: JwtPayload): string {
    if (currentUser.role === Role.FARMER) return currentUser.sub;
    if (currentUser.role === Role.ADMIN) {
      if (!dto.farmerId) {
        throw new BadRequestException(
          'farmerId is required when creating a booking on behalf of a farmer',
        );
      }
      return dto.farmerId;
    }
    throw new ForbiddenException('Insufficient role');
  }

  /**
   * A booking's preferred date is a *calendar day*, not an instant. Date-only
   * values are pinned to UTC midnight so the day a farmer picked is the day
   * every client reads back, and "in the past" is judged against the start of
   * today rather than the current time of day.
   */
  private parsePreferredDate(value: string): Date {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const date = new Date(isDateOnly ? `${value}T00:00:00.000Z` : value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Preferred date is not a valid date');
    }
    const now = new Date();
    const startOfToday = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    if (date.getTime() < startOfToday) {
      throw new BadRequestException('Preferred date cannot be in the past');
    }
    return date;
  }

  private async getOrThrow(id: string): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  /** Fetches a booking, 404-ing if a Farmer/Technician caller doesn't own it. */
  private async getScopedOrThrow(
    id: string,
    currentUser: JwtPayload,
  ): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (currentUser.role === Role.FARMER && booking.farmerId !== currentUser.sub) {
      throw new NotFoundException('Booking not found');
    }
    if (
      currentUser.role === Role.TECHNICIAN &&
      booking.technicianId !== currentUser.sub
    ) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }
}
