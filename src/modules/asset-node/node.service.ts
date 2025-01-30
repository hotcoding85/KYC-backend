import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Node } from './entity/node.entity';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Network } from '../asset-networks/entity/networks.entity';

@Injectable()
export class NodeService {
  private readonly saltRoundes: number;
  constructor(
    @InjectRepository(Node)
    private readonly nodeRepository: Repository<Node>,

    @InjectRepository(Network)
    private readonly networkRepository: Repository<Network>,

    private readonly configService: ConfigService,
  ) {
    this.saltRoundes = parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS'),
      10,
    );
  }

  async create(createNodeDto: CreateNodeDto) {
    const { networkId, ...nodeInfo } = createNodeDto;
    const network = await this.networkRepository.findOne({
      where: {
        network_id: networkId,
      },
    });
    if (!network) {
      throw new NotFoundException(
        `No Network with network id : ${networkId} esists`,
      );
    }

    const plainPassword = nodeInfo.password;
    const hashedPassword = await bcrypt.hash(plainPassword, this.saltRoundes);
    nodeInfo.password = hashedPassword;

    const node = this.nodeRepository.create({
      ...nodeInfo,
      network: network,
    });

    return await this.nodeRepository.save(node);
  }

  async getNodesByNetworkId(networkId: string) {
    return await this.nodeRepository.find({
      relations: {
        network: true,
      },
      where: { network: { network_id: networkId } },
    });
  }

  async getNodesByAssetId(assetId: string) {
    return await this.nodeRepository.find({
      where: {
        network: {
          asset: {
            asset_id: assetId,
          },
        },
      },
      relations: {
        network: true,
      },
    });
  }

  async updateNode(updateNodeDto: UpdateNodeDto, nodeId: string) {
    const node = await this.nodeRepository.findOne({
      where: { node_id: nodeId },
    });

    if (!node) {
      throw new NotFoundException(`No node with node id : ${nodeId} esists`);
    }

    if (updateNodeDto.password) {
      const plainPassword = updateNodeDto.password;
      const hashedPassword = await bcrypt.hash(plainPassword, this.saltRoundes);
      updateNodeDto.password = hashedPassword;
    }
    Object.assign(node, updateNodeDto);

    if (updateNodeDto.networkId) {
      const network = await this.networkRepository.findOne({
        where: {
          network_id: updateNodeDto.networkId,
        },
      });
      node.network = network;
    }

    return await this.nodeRepository.save(node);
  }

  async deleteNode(nodeId: string) {
    const node = await this.nodeRepository.findOne({
      where: { node_id: nodeId },
    });

    if (!node) {
      throw new NotFoundException(`Node with id ${nodeId} cannot be found`);
    }
    const result = await this.nodeRepository.delete({ node_id: nodeId });
    if (result.affected === 0) {
      throw new NotFoundException(`Node with ID "${nodeId}" not found`);
    }
  }
}
