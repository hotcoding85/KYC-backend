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

class CriteriaDto {
  @IsEnum(FEE_SCHEME_CRITERIA_TYPE)
  criteria: FEE_SCHEME_CRITERIA_TYPE;

  @IsEnum(FEE_SCHEME_CRITERIA_COMPARASION)
  comparasion: FEE_SCHEME_CRITERIA_COMPARASION;

  @IsString()
  value: string;
}

export class CreateCompanyFeeSchemeDto {
  @IsEnum(FEE_SCHEME_ACTIVITY)
  activity: FEE_SCHEME_ACTIVITY;

  @IsEnum(FEE_SCHEME_FEE_TYPE)
  feeType: FEE_SCHEME_FEE_TYPE;

  @IsNumber()
  fee: number;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsEnum(FEE_SCHEME_GAS_PRICE_TYPE)
  gasPriceType: FEE_SCHEME_GAS_PRICE_TYPE;

  @IsNumber()
  gasPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaDto)
  criteria: CriteriaDto[];

  @IsString()
  rules: string;

  @IsUUID()
  companyId: string;

  @IsString()
  @IsOptional()
  assetType?: string;
}
