import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ROLE } from 'src/lib/enums';

export class CreateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  @IsOptional()
  middle_name: string;

  @IsString()
  last_name: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean; // Optional, defaults to false in the entity

  @IsOptional()
  @IsEnum(ROLE)
  role?: ROLE;

  @IsOptional()
  @IsString()
  refresh_token?: string; // Optional, used for refresh token management

  @IsOptional()
  @IsString()
  authenticator_secret?: string;

  @IsString()
  company_id: string; // Id of the company
}
