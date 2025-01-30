import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { NODE_NETWORK_TYPE } from 'src/lib/enums';

export class CreateCompanyNodeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  ipAddress: string;

  @IsNotEmpty()
  @IsString()
  rpcPort: string;

  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  webSocketPort?: string;

  @IsOptional()
  @IsString()
  webSocketAddress?: string;

  @IsNotEmpty()
  @IsEnum(NODE_NETWORK_TYPE)
  networkType: NODE_NETWORK_TYPE;

  @IsOptional()
  @IsString()
  adminPannelPort?: string;

  @IsOptional()
  @IsString()
  noOfWallet?: string;

  @IsNotEmpty()
  @IsUUID()
  companyId: string;
}
