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

export class AddExerciseRecordDto {
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @IsOptional()
  date?: Date;
}
