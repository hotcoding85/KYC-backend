import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { NODE_NETWORK_TYPE } from 'src/lib/enums';

export class UpdateCompanyNodeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  rpcPort?: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  webSocketPort?: string;

  @IsOptional()
  @IsString()
  webSocketAddress?: string;

  @IsOptional()
  @IsEnum(NODE_NETWORK_TYPE)
  networkType?: NODE_NETWORK_TYPE;

  @IsOptional()
  @IsString()
  adminPannelPort?: string;

  @IsOptional()
  @IsString()
  noOfWallet?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}
