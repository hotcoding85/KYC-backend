import { IsEnum, IsIP, IsOptional, IsString, IsUUID } from 'class-validator';
import { NODE_NETWORK_TYPE } from 'src/lib/enums';

export class CreateNodeDto {
  @IsUUID()
  networkId: string;

  @IsString()
  name: string;

  @IsIP('4', { message: 'ipAddress must be a valid IP Address' })
  ipAddress: string;

  @IsString()
  rpcPort: string;

  @IsString()
  userName: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  wsPort: string;

  @IsString()
  @IsOptional()
  adminPannelPort: string;

  @IsString()
  @IsOptional()
  noOfWallet: string;

  @IsEnum(NODE_NETWORK_TYPE, {
    message: 'networkType must be either MAIN_NET or TEST_NET',
  })
  networkType: NODE_NETWORK_TYPE;

  @IsString()
  webSocketAddress: string;

  @IsString()
  webSocketPort: string;
}
