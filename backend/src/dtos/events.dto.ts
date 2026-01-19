import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  IsDateString,
} from 'class-validator';

export class ExerciseDto {
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  weight: string;

  @IsString()
  repetitions: string;

  @IsOptional()
  @IsString()
  rxWeight?: string;

  @IsOptional()
  @IsString()
  rxReps?: string;

  @IsOptional()
  @IsString()
  scWeight?: string;

  @IsOptional()
  @IsString()
  scReps?: string;
}

export class CreateEventDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  exerciseType?: string;

  @IsOptional()
  @IsArray()
  exercises?: ExerciseDto[]; // Exercises as array of objects

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  participantIds?: string[];

  @IsOptional()
  @IsString()
  timeCap?: string;

  @IsOptional()
  @IsString()
  rounds?: string;

  @IsOptional()
  @IsString()
  teamId?: string;
}

export class UpdateEventStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'past' | 'future';
}

export class CreateEventResultDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
