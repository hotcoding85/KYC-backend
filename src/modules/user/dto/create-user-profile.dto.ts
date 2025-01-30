import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNotEmpty, IsDate } from 'class-validator';

export class CreateUserProfileDto {
  @IsOptional()
  @IsString()
  image?: string;
/*
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateRegistered: Date;
*/
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dob?: Date;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  street?: string;

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

  @IsOptional()
  @IsString()
  tax?: string;

  @IsOptional()
  @IsString()
  poa?: string;

  @IsOptional()
  @IsString()
  proofOfAddressDocument?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  nationality?: string;
}
