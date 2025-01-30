import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNetworkDto } from './dto/create-network.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Network } from './entity/networks.entity';
import { Repository } from 'typeorm';
import { UpdateNetworkDto } from './dto/update-network.dto';
import { Asset } from '../asset/entities/asset.entity';

@Injectable()
export class NetworksService {
  constructor(
    @InjectRepository(Network)
    private readonly networkRepository: Repository<Network>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async createNetwork(createNetworkDto: CreateNetworkDto) {
    const { name, assetId } = createNetworkDto;
    const asset = await this.assetRepository.findOne({
      where: { asset_id: assetId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id:${assetId} does not exists`);
    }

    const newNetwork = this.networkRepository.create({
      name,
      asset,
    });
    return this.networkRepository.save(newNetwork);
  }

  async getNetworkById(networkId: string) {
    return this.networkRepository.findOne({
      where: { network_id: networkId },
      relations: {
        asset: true,
      },
    });
  }

  async updateNetwork(networkId: string, updateNetworkDto: UpdateNetworkDto) {
    const network = await this.networkRepository.findOne({
      where: { network_id: networkId },
    });

    if (!network) {
      throw new NotFoundException(`Network with ID "${networkId}" not found`);
    }

    if (updateNetworkDto.assetId) {
      const asset = await this.assetRepository.findOne({
        where: { asset_id: updateNetworkDto.assetId },
      });

      if (!asset) {
        throw new NotFoundException(
          `Asset with id ${updateNetworkDto.assetId} doesnot exists`,
        );
      }

      network.asset = asset;
    }

    // Update the network properties
    network.name = updateNetworkDto.name;

    // Save the updated network
    const updatedNetwork = await this.networkRepository.save(network);

    return updatedNetwork;
  }

  async deleteNetwork(networkId: string) {
    const network = await this.networkRepository.findOne({
      where: { network_id: networkId },
      relations: {
        nodes: true,
      },
    });

    if (!network) {
      throw new NotFoundException(`Network with ID "${networkId}" not found`);
    }

    if (network.nodes.length > 0) {
      throw new ConflictException(
        `This network has ${network.nodes.length} nodes associated with it, hence it cannot be deleted`,
      );
    }

    // Delete the network
    await this.networkRepository.remove(network);

    return {
      message: `Network with ID "${networkId}" has been successfully deleted.`,
    };
  }

  async getNetworksByAssetId(assetId: string) {
    return this.networkRepository.find({
      where: {
        asset: {
          asset_id: assetId,
        },
      },
      relations: {
        asset: true,
        nodes: true,
      },
    });
  }
}
