import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
} from 'class-validator';
import { ROLE } from 'src/lib/enums';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsString()
  @IsOptional()
  middle_name: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsEnum(ROLE)
  role?: ROLE;

  @IsOptional()
  @IsString()
  refresh_token?: string;

  @IsOptional()
  @IsInt()
  company_id?: string; // Optional company_id for updating
}
