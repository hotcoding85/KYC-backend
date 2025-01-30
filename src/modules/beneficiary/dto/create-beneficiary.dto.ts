import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsPhoneNumber,
  ValidateIf,
  IsDate,
} from 'class-validator';

export class CreateBeneficiaryDto {
  @IsString()
  full_name: string;

  @ValidateIf((obj) => obj.email !== '') // Skip validation if email is an empty string
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsPhoneNumber(null) // Null allows auto-detection of region based on input
  @IsOptional()
  phone: string;

  @IsOptional()
  @IsString()
  phoneCountryCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsEnum(['Individual', 'Business'])
  @IsOptional()
  type?: 'Individual' | 'Business';

  @IsEnum(['M', 'F'])
  @IsOptional()
  gender?: 'M' | 'F';

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  deleted?: boolean;
}
