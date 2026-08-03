import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  serviceNotes?: string;
}
