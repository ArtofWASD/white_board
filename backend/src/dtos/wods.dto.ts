import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateWodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  scheme: string;

  @IsString()
  @IsOptional()
  preview?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  muscleGroups?: string[];
}

export class UpdateWodDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  scheme?: string;

  @IsString()
  @IsOptional()
  preview?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  muscleGroups?: string[];
}
