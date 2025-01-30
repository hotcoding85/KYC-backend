import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class CreateUserOnboardingDto {
  @IsOptional()
  @IsNumber()
  netWorth?: number;

  @IsOptional()
  @IsNumber()
  annualIncome?: number;

  @IsOptional()
  @IsNumber()
  monthlyTurnover?: number;

  @IsOptional()
  @IsNumber()
  transactionActivity?: number;

  @IsOptional()
  @IsNumber()
  purchaseMonthlyCrypto?: number;

  @IsOptional()
  @IsNumber()
  purchaseAverageCrypto?: number;

  @IsOptional()
  @IsNumber()
  purchaseTotalCrypto?: number;

  @IsOptional()
  @IsNumber()
  sellMonthlyCrypto?: number;

  @IsOptional()
  @IsNumber()
  sellAverageCrypto?: number;

  @IsOptional()
  @IsNumber()
  sellTotalCrypto?: number;

  @IsOptional()
  @IsNumber()
  bitcoinTrading?: number;

  @IsOptional()
  @IsNumber()
  ethereumTrading?: number;

  @IsOptional()
  @IsNumber()
  tetherTrading?: string;

  @IsOptional()
  @IsNumber()
  otherTrading?: number;

  @IsOptional()
  @IsBoolean()
  employed?: boolean;

  @IsOptional()
  @IsString()
  employerName?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsBoolean()
  irsConfirm?: boolean;

  @IsOptional()
  @IsBoolean()
  factaConfirm?: boolean;

  @IsOptional()
  @IsBoolean()
  criminalConfirm?: boolean;

  @IsOptional()
  @IsBoolean()
  accurateConfirm?: boolean;
}
