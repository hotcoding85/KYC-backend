import { IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAssetInfoDTO {
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Minimum balance must be greater than or equal to 0' })
  minimumBalance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Maximum balance must be greater than or equal to 0' })
  maximumBalance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: 'Minimum Transfer Amount must be greater than or equal to 0',
  })
  minimumTransferAmmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: 'Maximum Transfer Amount must be greater than or equal to 0',
  })
  maximumTransferAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: 'Minimum Purchase Amount must be greater than or equal to 0',
  })
  minimumPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: 'Maximum Purchase Amount must be greater than or equal to 0',
  })
  maximumPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: 'Minimum Receive Amount must be greater than or equal to 0',
  })
  minimumReceiveAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: 'Maximum Receive Amount must be greater than or equal to 0',
  })
  maximumReceiveAmount?: number;

  @IsOptional()
  @IsBoolean()
  newAddressForEveryTransaction?: boolean;
}
