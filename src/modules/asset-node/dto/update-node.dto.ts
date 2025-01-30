import { IsEnum, IsIP, IsOptional, IsString, IsUUID } from 'class-validator';
import { NODE_NETWORK_TYPE } from 'src/lib/enums';

export class UpdateNodeDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsIP('4', { message: 'ipAddress must be a valid IP Address' })
  @IsOptional()
  ipAddress: string;

  @IsString()
  @IsOptional()
  rpcPort: string;

  @IsString()
  @IsOptional()
  userName: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  adminPannelPort: string;

  @IsString()
  @IsOptional()
  noOfWallet: string;

  @IsOptional()
  @IsEnum(NODE_NETWORK_TYPE, {
    message: 'network must be either MAIN_NET or TEST_NET',
  })
  networkType: NODE_NETWORK_TYPE;

  @IsString()
  @IsOptional()
  webSocketAddress: string;

  @IsString()
  @IsOptional()
  webSocketPort: string;

  @IsUUID()
  @IsOptional()
  networkId: string;
}
