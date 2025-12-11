import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  IsUUID,
  IsEnum,
  IsArray,
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
  // Validate against string values of the enum
  @IsEnum(['ATHLETE', 'TRAINER', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN'])
  role: 'ATHLETE' | 'TRAINER' | 'ORGANIZATION_ADMIN' | 'SUPER_ADMIN';

  @IsString()
  @IsOptional()
  gender?: 'MALE' | 'FEMALE' | 'OTHER';

  @IsString()
  @IsOptional()
  userType?: string; // Keep for backward compat, but ignore in logic

  @IsString()
  @IsOptional()
  organizationName?: string; // Used to create/find Organization
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

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dashboardLayout?: string[];

  @IsOptional()
  @IsString()
  dashboardLayoutMode?: string;
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
