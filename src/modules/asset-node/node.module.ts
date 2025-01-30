import { Module } from '@nestjs/common';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from '../asset/entities/asset.entity';
import { Node } from './entity/node.entity';
import { ConfigModule } from '@nestjs/config';
import { Network } from '../asset-networks/entity/networks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Node, Network]), ConfigModule],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeModule {}
