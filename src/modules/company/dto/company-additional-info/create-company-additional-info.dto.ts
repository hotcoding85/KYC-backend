import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCompanyAdditionalInfoDto {
  @IsString()
  requestedInformationDetail: string;

  @IsBoolean()
  proofOfAddress: boolean;

  @IsBoolean()
  financialStatement: boolean;

  @IsBoolean()
  businessLicense: boolean;

  @IsBoolean()
  other: boolean;

  @IsString()
  @IsOptional()
  otherDescription: string;
}
