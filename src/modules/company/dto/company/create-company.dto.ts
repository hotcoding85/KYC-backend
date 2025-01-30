import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { COMPANY_ACCOUNT_TYPE } from 'src/lib/enums';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Business email must be a valid email address' })
  business_email: string;

  @IsOptional()
  @IsString()
  business_name?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  business_website?: string;

  @IsOptional()
  @IsString()
  year_of_incorporation?: string;

  @IsOptional()
  @IsString()
  trading_name?: string;

  @IsOptional()
  @IsString()
  address_line_one?: string;

  @IsOptional()
  @IsString()
  address_line_two?: string;

  @IsOptional()
  @IsString()
  country_of_incorporation?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsOptional()
  @IsEnum(COMPANY_ACCOUNT_TYPE)
  company_account_type?: COMPANY_ACCOUNT_TYPE;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
