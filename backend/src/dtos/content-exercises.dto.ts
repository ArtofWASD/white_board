import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
}
