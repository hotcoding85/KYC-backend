import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetFeeScheme } from './entity/asset-fee-scheme.entity';
import { Repository } from 'typeorm';
import { CreateFeeSchemeDto } from './dto/create-fee-scheme.dto';
import { UpdateFeeSchemeDto } from './dto/update-fee-scheme.dto';
import { Network } from '../asset-networks/entity/networks.entity';

@Injectable()
export class FeeSchemeService {
  constructor(
    @InjectRepository(AssetFeeScheme)
    private feeSchemeRepository: Repository<AssetFeeScheme>,
    @InjectRepository(Network)
    private networkRepository: Repository<Network>,
  ) {}

  async create(createFeeSchemeDto: CreateFeeSchemeDto) {
    const network = await this.networkRepository.findOne({
      where: { network_id: createFeeSchemeDto.networkId },
    });
    if (!network) {
      throw new NotFoundException(
        `Network with ID ${createFeeSchemeDto.networkId} not found`,
      );
    }

    const feeScheme = this.feeSchemeRepository.create(createFeeSchemeDto);
    feeScheme.network = network;
    return this.feeSchemeRepository.save(feeScheme);
  }

  findAll(networkId?: string) {
    if (networkId) {
      return this.feeSchemeRepository.find({
        where: { network: { network_id: networkId } },
        relations: ['asset'],
      });
    }
    return this.feeSchemeRepository.find({ relations: ['asset'] });
  }

  async findOne(id: string) {
    const feeScheme = await this.feeSchemeRepository.findOne({
      where: { fee_scheme_id: id },
      relations: {
        network: true,
      },
    });
    if (!feeScheme) {
      throw new NotFoundException(`Fee Scheme with ID ${id} not found`);
    }
    return feeScheme;
  }

  async update(id: string, updateFeeSchemeDto: UpdateFeeSchemeDto) {
    const feeScheme = await this.feeSchemeRepository.findOne({
      where: { fee_scheme_id: id },
    });

    if (updateFeeSchemeDto.networkId) {
      const network = await this.networkRepository.findOne({
        where: { network_id: updateFeeSchemeDto.networkId },
      });
      if (!network) {
        throw new NotFoundException(
          `Network with ID ${updateFeeSchemeDto.networkId} not found`,
        );
      }
      feeScheme.network = network;
    }

    Object.assign(feeScheme, updateFeeSchemeDto);
    return this.feeSchemeRepository.save(feeScheme);
  }

  async remove(id: string) {
    const feeScheme = await this.feeSchemeRepository.findOne({
      where: { fee_scheme_id: id },
    });
    return this.feeSchemeRepository.remove(feeScheme);
  }

  async getByNetworkId(networkId: string) {
    const result = await this.feeSchemeRepository.find({
      where: {
        network: {
          network_id: networkId,
        },
      },
    });

    return result;
  }
}
