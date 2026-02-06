import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateDirectChatDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;
}

export class CreateTeamChatDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  @IsEnum(['text', 'image', 'video_link'])
  type?: 'text' | 'image' | 'video_link';
}
