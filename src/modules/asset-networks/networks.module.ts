import { Module } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { NetworksController } from './networks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Network } from './entity/networks.entity';
import { Asset } from '../asset/entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Network])],
  providers: [NetworksService],
  controllers: [NetworksController],
})
export class NetworksModule {}
