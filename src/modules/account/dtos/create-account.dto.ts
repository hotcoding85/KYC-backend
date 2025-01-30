import { IsString, IsOptional, IsJSON } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  company_id: string;

  @IsString()
  asset_id: string;

  @IsString()
  network_id: string;

  @IsOptional()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsJSON()
  account_detail: string;

  @IsOptional()
  @IsString()
  account_number: string;
}
