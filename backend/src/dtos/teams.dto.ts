import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';

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
  @IsEnum(['MEMBER', 'ADMIN', 'OWNER'])
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
}

export class RemoveTeamMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
