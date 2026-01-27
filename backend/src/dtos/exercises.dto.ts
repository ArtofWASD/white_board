import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsOptional()
  initialWeight?: number;
}

export class CreateGlobalExerciseDto {
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

export class UpdateExerciseDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    @IsString()
    @IsOptional()
    videoUrl?: string;
}

export class AddExerciseRecordDto {
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @IsOptional()
  date?: Date;
}
