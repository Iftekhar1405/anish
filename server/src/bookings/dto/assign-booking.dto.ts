import { IsString } from 'class-validator';

export class AssignBookingDto {
  @IsString()
  technicianId!: string;
}
