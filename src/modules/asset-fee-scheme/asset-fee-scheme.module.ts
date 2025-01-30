import { Module } from '@nestjs/common';
import { FeeSchemeController } from './asset-fee-scheme.controller';
import { FeeSchemeService } from './asset-fee-scheme.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetFeeScheme } from './entity/asset-fee-scheme.entity';
import { Network } from '../asset-networks/entity/networks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetFeeScheme, Network])],
  controllers: [FeeSchemeController],
  providers: [FeeSchemeService],
})
export class FeeSchemeModule {}
