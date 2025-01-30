import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { FEE_SCHEME_CRITERIA_COMPARASION } from 'src/lib/enums';

class CriteriaDto {
  @IsEnum(FEE_SCHEME_CRITERIA_COMPARASION)
  comparasion: FEE_SCHEME_CRITERIA_COMPARASION;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateSweepScheduleDto {
  @IsString()
  @IsNotEmpty()
  scheduleOn: string; // Either "GAS_PRICE" or "DURATION"

  @ValidateIf((dto: CreateSweepScheduleDto) => dto.scheduleOn === 'GAS_PRICE')
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaDto)
  rules?: CriteriaDto[] | null;

  @ValidateIf((dto: CreateSweepScheduleDto) => dto.scheduleOn === 'DURATION')
  @IsString()
  @IsOptional()
  repeat?: string;

  @ValidateIf((dto: CreateSweepScheduleDto) => dto.scheduleOn === 'DURATION')
  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsNotEmpty()
  networkId: string;

  @IsString()
  @IsNotEmpty()
  assetId: string;
}
