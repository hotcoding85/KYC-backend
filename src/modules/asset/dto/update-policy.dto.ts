import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateAssetPolicyDTO {
  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: 'Internal transfer fee must be greater than or equal to 0',
  })
  internalTransferFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, {
    message: 'External transfer fee should be greater than or equal to 0',
  })
  externalTransferFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Purchase fee should be greater than or equal to 0' })
  purchaseFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Receive fee should be greater than or equal to 0' })
  ReceiveFee?: number;
}
