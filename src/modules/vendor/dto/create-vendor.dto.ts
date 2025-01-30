import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsUUID,
  IsArray,
} from 'class-validator';
import { VENDOR_TYPE } from 'src/lib/enums';

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsEnum(VENDOR_TYPE)
  @IsOptional()
  type?: VENDOR_TYPE;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  website?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assetIds?: string[];

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  vendorConnectionIds?: string[];
}
