import { IsNumber, Min, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { EOA_SCHEDULE } from 'src/lib/enums';

export class UpdateAssetProtocolDTO {
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Minimum Sweep Amount must be greater than or equal to 0' })
  minimumSweepAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Maximum Sweep Amount must be greater than or equal to 0' })
  maximumSweepAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: 'Maximum EOA Limit must be greater than or equal to 0',
  })
  maximumEOALimit?: number;

  @IsOptional()
  @IsBoolean()
  sweepEOA?: boolean;

  @IsOptional()
  @IsBoolean()
  useEOAAdress?: boolean;

  @IsOptional()
  @IsBoolean()
  internalEOATransaction?: boolean;

  @IsOptional()
  @IsBoolean()
  newAddressForEveryTransaction?: boolean;

  @IsOptional()
  @IsEnum(EOA_SCHEDULE)
  sweepEOASchedule?: EOA_SCHEDULE;
}
