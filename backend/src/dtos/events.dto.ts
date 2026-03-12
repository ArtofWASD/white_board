import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  IsDateString,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExerciseDto {
  @IsDefined()
  id: string | number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  repetitions?: string;

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

  @IsOptional()
  @IsBoolean()
  isRecord?: boolean;

  @IsOptional()
  @IsNumber()
  week?: number;

  @IsOptional()
  @IsString()
  exerciseId?: string;

  @IsOptional()
  @IsString()
  measurement?: string;

  @IsOptional()
  @IsString()
  rxTime?: string;

  @IsOptional()
  @IsString()
  scTime?: string;

  @IsOptional()
  @IsString()
  rxDistance?: string;

  @IsOptional()
  @IsString()
  scDistance?: string;

  @IsOptional()
  @IsString()
  rxDistanceWeight?: string;

  @IsOptional()
  @IsString()
  scDistanceWeight?: string;

  @IsOptional()
  @IsString()
  rxCalories?: string;

  @IsOptional()
  @IsString()
  scCalories?: string;
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
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises?: ExerciseDto[]; // Упражнения как массив объектов

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

  @IsOptional()
  @IsString()
  scheme?: string;

  @IsOptional()
  @IsString()
  calculatorType?: string;
}

export class UpdateEventStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'COMPLETED' | 'FUTURE';
}

export class CreateEventResultDto {
  @IsOptional()
  @IsString()
  eventId?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  scaling?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
