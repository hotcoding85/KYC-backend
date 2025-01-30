import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ASSET_TYPE } from 'src/lib/enums';

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  ticker?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  usd_value?: number;

  @IsOptional()
  @IsNumber()
  daily_volume?: number;

  @IsOptional()
  @IsEnum(ASSET_TYPE)
  type?: ASSET_TYPE;

  @IsOptional()
  @IsArray()
  liquidity?: string[];

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}
