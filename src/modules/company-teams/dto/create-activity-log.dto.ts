import { IsIP, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateActivityLogDto {
  @IsNotEmpty()
  @IsString()
  activityType: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  details: string;

  @IsNotEmpty()
  @IsIP()
  ipAddress: string;

  @IsNotEmpty()
  @IsString()
  deviceBrowser: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
