import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateNetworkDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsUUID()
  @IsOptional()
  assetId: string;
}
