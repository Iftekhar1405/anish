import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingInterceptor } from './common/logging.interceptor';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SpeciesModule } from './species/species.module';
import { BreedsModule } from './breeds/breeds.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DistrictsModule } from './districts/districts.module';
import { ServiceAreasModule } from './service-areas/service-areas.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CatalogueModule } from './catalogue/catalogue.module';
import { BatchesModule } from './batches/batches.module';
import { AnimalsModule } from './animals/animals.module';
import { BookingsModule } from './bookings/bookings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    SpeciesModule,
    BreedsModule,
    OrganizationsModule,
    DistrictsModule,
    ServiceAreasModule,
    CloudinaryModule,
    CatalogueModule,
    BatchesModule,
    AnimalsModule,
    BookingsModule,
    NotificationsModule,
    SettingsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
