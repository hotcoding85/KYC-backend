// dto/session-data-update.dto.ts

import { IsString, IsOptional, IsDate } from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  source: string;

  @IsString()
  ip: string;

  @IsString()
  platform: string;

  @IsString()
  browser: string;

  @IsString()
  device_type: string;

  @IsString()
  maker: string;

  @IsString()
  model: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  longitude?: string;

  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  token: string;

  @IsDate()
  expires: Date;
}
