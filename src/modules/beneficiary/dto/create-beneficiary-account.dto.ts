import {
    IsString,
    IsEmail,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsUUID,
    IsPhoneNumber,
  } from 'class-validator';
  
  export class CreateBeneficiaryAccountDto {
    @IsEmail()
    @IsOptional()
    account_number: string;
  
    @IsString()
    @IsOptional()
    account_detail?: string;
  
    @IsString() 
    @IsOptional()
    iban: string;
  
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
  