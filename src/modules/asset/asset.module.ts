import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from '../vendor/entities/vendor.entity'; // Import Vendor entity
import { VendorService } from '../vendor/vendor.service';
import { Asset } from './entities/asset.entity';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { CommonModule } from '../common/common.module';
import { AssetFeeScheme } from '../asset-fee-scheme/entity/asset-fee-scheme.entity';
import { VendorConnection } from '../vendor-connection/entities/vendor-connection.entity';
import { AssetInformation } from './entities/asset-information.entity';
import { AssetFeePolicy } from './entities/asset-policy.entity';
import { Network } from '../asset-networks/entity/networks.entity';
import { Account } from '../account/entities/account.entity';
import { AssetProtocol } from './entities/asset-protocol.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      Vendor,
      AssetFeeScheme,
      VendorConnection,
      AssetInformation,
      AssetProtocol,
      AssetFeePolicy,
      Network,
      Account,
    ]),
    CommonModule,
  ], // Add Vendor to TypeOrmModule
  providers: [AssetService, VendorService],
  controllers: [AssetController],
  exports: [AssetService],
})
export class AssetModule {}
