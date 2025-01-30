import { Type } from 'class-transformer';
import { IsOptional, IsString, IsDate, IsBoolean } from 'class-validator';

export class UpdateBeneficiaryAccountDto {
  @IsOptional()
  @IsString()
  accoun_detail?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  iban?: string;

}
