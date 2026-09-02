import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Notification, NotificationEvent, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildResult, PaginatedResult, paginate } from '../common/pagination';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { ListNotificationsQueryDto } from './dto/list-notifications-query.dto';

interface NotifyInput {
  userId: string;
  event: NotificationEvent;
  title: string;
  body: string;
  bookingId?: string;
}

/**
 * Notifications are always recorded in-app (Notification rows), independent
 * of whether push delivery is configured. FCM is best-effort on top: a
 * missing/misconfigured Firebase project must never break a booking
 * transition, so send failures are logged and swallowed, never thrown.
 */
@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private configured = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    const projectId = this.config.get<string>('FCM_PROJECT_ID');
    const clientEmail = this.config.get<string>('FCM_CLIENT_EMAIL');
    const privateKey = this.config.get<string>('FCM_PRIVATE_KEY');
    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials missing — push notifications will be recorded in-app only, no FCM will be sent.',
      );
      return;
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    this.configured = true;
  }

  async registerToken(userId: string, token: string): Promise<void> {
    await this.prisma.deviceToken.upsert({
      where: { token },
      update: { userId },
      create: { userId, token },
    });
  }

  /** Records the notification and best-effort pushes it. Never throws. */
  async notifyUser(input: NotifyInput): Promise<void> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        event: input.event,
        title: input.title,
        body: input.body,
        bookingId: input.bookingId,
      },
    });
    await this.pushToUser(input.userId, notification);
  }

  async broadcast(dto: BroadcastNotificationDto): Promise<{ recipients: number }> {
    const targets = await this.prisma.user.findMany({
      where: { isActive: true, ...(dto.role ? { role: dto.role } : {}) },
      select: { id: true },
    });
    for (const target of targets) {
      const notification = await this.prisma.notification.create({
        data: {
          userId: target.id,
          event: NotificationEvent.ADMIN_BROADCAST,
          title: dto.title,
          body: dto.body,
        },
      });
      await this.pushToUser(target.id, notification);
    }
    return { recipients: targets.length };
  }

  async listMine(
    userId: string,
    query: ListNotificationsQueryDto,
  ): Promise<PaginatedResult<Notification>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.event ? { event: query.event } : {}),
      ...(query.unreadOnly ? { readAt: null } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  async listAll(query: ListNotificationsQueryDto): Promise<PaginatedResult<Notification>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.NotificationWhereInput = {
      ...(query.event ? { event: query.event } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, role: true } } },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.readAt) return notification;
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  private async pushToUser(userId: string, notification: Notification): Promise<void> {
    if (!this.configured) return;
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true },
    });
    if (tokens.length === 0) return;
    try {
      await admin.messaging().sendEachForMulticast({
        tokens: tokens.map((t) => t.token),
        notification: { title: notification.title, body: notification.body },
        data: notification.bookingId ? { bookingId: notification.bookingId } : {},
        // Android 8+ drops a notification whose channel doesn't exist, so this
        // id must match the channel the apps create at startup. 'high' keeps
        // delivery prompt when the device is dozing.
        android: {
          priority: 'high',
          notification: { channelId: 'default' },
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to push notification ${notification.id}: ${String(err)}`);
    }
  }
}
