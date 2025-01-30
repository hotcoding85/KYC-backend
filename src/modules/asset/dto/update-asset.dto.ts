import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { ASSET_TYPE } from 'src/lib/enums';

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  @Expose()
  name?: string;

  @IsOptional()
  @IsString()
  @Expose()
  ticker?: string;

  @IsOptional()
  @IsString()
  @Expose()
  country?: string;

  @IsOptional()
  @IsString()
  @Expose()
  icon?: string;

  @IsOptional()
  @IsNumber()
  @Expose()
  usd_value?: number;

  @IsOptional()
  @IsNumber()
  @Expose()
  daily_volume?: number;

  @Expose()
  @IsOptional()
  @IsEnum(ASSET_TYPE)
  type?: ASSET_TYPE;

  @IsOptional()
  @IsBoolean()
  @Expose()
  status?: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  @Expose()
  deleted?: boolean;

  @IsOptional()
  @IsArray()
  @Expose()
  liquidity?: string[];
}
