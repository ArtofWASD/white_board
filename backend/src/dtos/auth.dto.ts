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
  @IsOptional() // Фамилия необязательна
  lastName?: string; // Добавляем поле фамилии

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  // Валидация строковых значений перечисления
  @IsEnum(['ATHLETE', 'TRAINER', 'ORGANIZATION_ADMIN'])
  role: 'ATHLETE' | 'TRAINER' | 'ORGANIZATION_ADMIN';

  @IsString()
  @IsOptional()
  gender?: 'MALE' | 'FEMALE' | 'OTHER';

  @IsString()
  @IsOptional()
  userType?: string; // Оставляем для обратной совместимости, но игнорируем в логике

  @IsString()
  @IsOptional()
  organizationName?: string; // Используется для создания/поиска организации
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

// DTO команд
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
