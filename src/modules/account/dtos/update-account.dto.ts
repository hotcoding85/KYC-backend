import { IsNumber, IsOptional, IsString, IsJSON } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  @IsString()
  asset_id?: string;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsJSON()
  account_detail?: string;

  @IsOptional()
  @IsString()
  account_number?: string;
}
