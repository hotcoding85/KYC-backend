import { IsString, IsUUID } from 'class-validator';

export class CreateNetworkDto {
  @IsString()
  name: string;

  @IsUUID()
  assetId: string;
}
