import {
  IsEnum,
  IsNumber,
  IsDate,
  IsUUID,
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FEE_SCHEME_ACTIVITY,
  FEE_SCHEME_CRITERIA_COMPARASION,
  FEE_SCHEME_CRITERIA_TYPE,
  FEE_SCHEME_FEE_TYPE,
  FEE_SCHEME_GAS_PRICE_TYPE,
} from 'src/lib/enums';

class UpdateCriteriaDto {
  @IsEnum(FEE_SCHEME_CRITERIA_TYPE)
  @IsOptional()
  criteria?: FEE_SCHEME_CRITERIA_TYPE;

  @IsEnum(FEE_SCHEME_CRITERIA_COMPARASION)
  @IsOptional()
  comparasion?: FEE_SCHEME_CRITERIA_COMPARASION;

  @IsString()
  @IsOptional()
  value?: string;
}

export class UpdateCompanyFeeSchemeDto {
  @IsEnum(FEE_SCHEME_ACTIVITY)
  @IsOptional()
  activity?: FEE_SCHEME_ACTIVITY;

  @IsEnum(FEE_SCHEME_FEE_TYPE)
  @IsOptional()
  feeType?: FEE_SCHEME_FEE_TYPE;

  @IsNumber()
  @IsOptional()
  fee?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startTime?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endTime?: Date;

  @IsEnum(FEE_SCHEME_GAS_PRICE_TYPE)
  @IsOptional()
  gasPriceType?: FEE_SCHEME_GAS_PRICE_TYPE;

  @IsNumber()
  @IsOptional()
  gasPrice?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCriteriaDto)
  @IsOptional()
  criteria?: UpdateCriteriaDto[];

  @IsString()
  @IsOptional()
  rules?: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  assetType?: string;
}
