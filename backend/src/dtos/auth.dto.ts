import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  IsUUID,
  IsEnum,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional() // Last name is optional
  lastName?: string; // Adding last name field

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  role: 'trainer' | 'athlete';

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  registrationType?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

// Team DTOs
export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddTeamMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsEnum(['athlete', 'trainer'])
  role: 'athlete' | 'trainer';
}

export class RemoveTeamMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
