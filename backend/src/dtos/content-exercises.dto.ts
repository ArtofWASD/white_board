import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateContentExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsArray()
  @IsOptional()
  muscleGroups?: string[];
}

export class UpdateContentExerciseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsArray()
  @IsOptional()
  muscleGroups?: string[];
}
