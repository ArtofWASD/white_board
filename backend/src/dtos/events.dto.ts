import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateEventDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDate()
  @IsNotEmpty()
  eventDate: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  exerciseType?: string;
}

export class UpdateEventStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'past' | 'future';
}
