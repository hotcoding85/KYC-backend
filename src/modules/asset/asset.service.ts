import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { Vendor } from '../vendor/entities/vendor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UtilityService } from '../common/utility/utility.service';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetInformation } from './entities/asset-information.entity';
import { UpdateAssetInfoDTO } from './dto/update-asset-info.dto';
import { AssetFeePolicy } from './entities/asset-policy.entity';
import { UpdateAssetPolicyDTO } from './dto/update-policy.dto';
import { Network } from '../asset-networks/entity/networks.entity';
import { UpdateAssetProtocolDTO } from './dto/update-asset-protocol.dto';
import { AssetProtocol } from './entities/asset-protocol.entity';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,

    private utilityService: UtilityService,

    @InjectRepository(AssetInformation)
    private readonly assetInfoRepository: Repository<AssetInformation>,

    @InjectRepository(AssetProtocol)
    private readonly assetProtocolRepository: Repository<AssetProtocol>,

    @InjectRepository(AssetFeePolicy)
    private assetPolicyRepository: Repository<AssetFeePolicy>,

    @InjectRepository(Network)
    private networkRepository: Repository<Network>,
  ) {}

  async check(createAssetDto: CreateAssetDto): Promise<Asset[]> {
    const whereCondition: any = {}; // Initialize an empty condition object

    if (createAssetDto.name) {
      whereCondition.name = createAssetDto.name;
    }

    if (createAssetDto.ticker) {
      whereCondition.ticker = createAssetDto.ticker;
    }

    return await this.assetRepository.find({
      where: whereCondition,
    });
  }

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const { liquidity, icon, ...assetInfo } = createAssetDto;

    const newAsset = this.assetRepository.create(assetInfo);

    if (liquidity && liquidity.length > 0) {
      const vendors = await this.vendorRepository.find({
        where: { vendor_id: In(liquidity) },
      });

      newAsset.liquidity = vendors;
    }

    const extensionMatch = icon.match(/\/(.*?);base64,/);
    const extension = extensionMatch ? extensionMatch[1] : 'png'; // default to 'png' if no match

    // Create a file name with the extension
    const fileName = `${createAssetDto.name}_${Date.now()}.${extension}`;

    // Remove the Base64 prefix
    const base64Data = icon.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (icon) {
      const path = await this.utilityService.uploadToS3(
        'watpay',
        `assets/${fileName}`,
        buffer,
      );

      newAsset.icon = path.Location;
    }

    return await this.assetRepository.save(newAsset);
  }

  async findAll(): Promise<Asset[]> {
    return await this.assetRepository.find({
      relations: {
        liquidity: true,
      },
    });
  }

  async getAssetById(assetId: string) {
    return await this.assetRepository.findOne({
      relations: {
        liquidity: true,
      },
      where: {
        asset_id: assetId,
      },
    });
  }

  async update(
    assetId: string,
    updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { asset_id: assetId },
      relations: ['liquidity'],
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID "${assetId}" not found`);
    }

    const { liquidity, icon, ...assetInfo } = updateAssetDto;

    Object.keys(assetInfo).forEach((key) => {
      if (assetInfo[key] !== undefined && assetInfo[key] !== null) {
        asset[key] = assetInfo[key];
      }
    });

    if (liquidity) {
      await this.assetRepository
        .createQueryBuilder()
        .relation(Asset, 'liquidity')
        .of(asset)
        .remove(asset.liquidity);

      if (liquidity && liquidity.length > 0) {
        const vendors = await this.vendorRepository.find({
          where: { vendor_id: In(liquidity) },
        });
        asset.liquidity = vendors;
      } else {
        asset.liquidity = [];
      }
    } else {
      delete asset.liquidity;
    }

    //if same icon is sent from the front end then dont update the icon
    if (icon && asset.icon !== icon) {
      if (asset.icon) {
        await this.utilityService.deleteImageByUrl(asset.icon);
      }

      // Upload new icon
      const extensionMatch = icon.match(/\/(.*?);base64,/);
      const extension = extensionMatch ? extensionMatch[1] : 'png';
      const fileName = `${asset.name}_${Date.now()}.${extension}`;
      const base64Data = icon.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const path = await this.utilityService.uploadToS3(
        'watpay',
        `assets/${fileName}`,
        buffer,
      );

      asset.icon = path.Location;
    }
    return await this.assetRepository.save(asset);
  }

  async getOrCreateAssetInfo(assetId: string, networkId: string) {
    const assetInfo = await this.assetInfoRepository.findOne({
      where: {
        asset: {
          asset_id: assetId,
        },
        network: {
          network_id: networkId,
        },
      },
    });

    // if asset info exists then return it
    if (assetInfo) {
      return assetInfo;
    }

    //if not then create a new one with default values and send it back

    const fetchedAsset = await this.assetRepository.findOne({
      where: {
        asset_id: assetId,
      },
    });

    const fetchedNetwork = await this.networkRepository.findOne({
      where: {
        network_id: networkId,
      },
    });

    if (!fetchedAsset) {
      throw new NotFoundException(
        `Asset with asset id ${assetId} doesnot exists`,
      );
    }
    if (!fetchedNetwork) {
      throw new NotFoundException(
        `Netowrk with network id ${networkId} doesnot exists`,
      );
    }

    const newAssetInfo = this.assetInfoRepository.create({
      asset: fetchedAsset,
      network: fetchedNetwork,
      minimumBalance: 0,
      maximumBalance: 0,
      minimumTransferAmmount: 0,
      maximumTransferAmount: 0,
      minimumPurchaseAmount: 0,
      maximumPurchaseAmount: 0,
      minimumReceiveAmount: 0,
      maximumReceiveAmount: 0,
      newAddressForEveryTransaction: false,
    });

    return this.assetInfoRepository.save(newAssetInfo);
  }

  async editAssetInfo(
    assetId: string,
    networkId: string,
    updateAssetInfoDTO: UpdateAssetInfoDTO,
  ) {
    const assetInfo = await this.assetInfoRepository.findOne({
      where: {
        asset: { asset_id: assetId },
        network: { network_id: networkId },
      },
    });

    if (!assetInfo) {
      throw new NotFoundException(
        `Asset info not found for asset ID ${assetId} and network ID ${networkId}`,
      );
    }

    Object.assign(assetInfo, updateAssetInfoDTO);

    return this.assetInfoRepository.save(assetInfo);
  }

  async getOrCreateAssetProtocol(assetId: string, networkId: string) {
    const assetProtocol = await this.assetProtocolRepository.findOne({
      where: {
        asset: {
          asset_id: assetId,
        },
        network: {
          network_id: networkId,
        },
      },
    });

    // if asset info exists then return it
    if (assetProtocol) {
      return assetProtocol;
    }

    //if not then create a new one with default values and send it back

    const fetchedAsset = await this.assetRepository.findOne({
      where: {
        asset_id: assetId,
      },
    });

    const fetchedNetwork = await this.networkRepository.findOne({
      where: {
        network_id: networkId,
      },
    });

    if (!fetchedAsset) {
      throw new NotFoundException(
        `Asset with asset id ${assetId} doesnot exists`,
      );
    }
    if (!fetchedNetwork) {
      throw new NotFoundException(
        `Netowrk with network id ${networkId} doesnot exists`,
      );
    }

    const newAssetProtocol = this.assetProtocolRepository.create({
      asset: fetchedAsset,
      network: fetchedNetwork,
      minimumSweepAmount: 0,
      maximumSweepAmount: 0,
      maximumEOALimit: 0,
      sweepEOA: false,
      useEOAAdress: false,
      internalEOATransaction: false,
      newAddressForEveryTransaction: false
    });

    return this.assetProtocolRepository.save(newAssetProtocol);
  }

  async editAssetProtocol(
    assetId: string,
    networkId: string,
    updateAssetProtocolDTO: UpdateAssetProtocolDTO,
  ) {
    const assetProtocol = await this.assetProtocolRepository.findOne({
      where: {
        asset: { asset_id: assetId },
        network: { network_id: networkId },
      },
    });

    if (!assetProtocol) {
      throw new NotFoundException(
        `Asset info not found for asset ID ${assetId} and network ID ${networkId}`,
      );
    }

    Object.assign(assetProtocol, updateAssetProtocolDTO);

    return this.assetProtocolRepository.save(assetProtocol);
  }

  async getOrCreateAssetPolicy(networkId: string): Promise<AssetFeePolicy> {
    const assetPolicy = await this.assetPolicyRepository.findOne({
      where: {
        network: { network_id: networkId },
      },
      relations: {
        network: true,
      },
    });

    if (assetPolicy) {
      return assetPolicy;
    }

    const fetchedNetwork = await this.networkRepository.findOne({
      where: {
        network_id: networkId,
      },
    });

    if (!fetchedNetwork) {
      throw new NotFoundException(
        `Netowrk with network id ${networkId} doesnot exists`,
      );
    }

    const newAssetPolicy = this.assetPolicyRepository.create({
      network: fetchedNetwork,
      internalTransferFee: 0,
      externalTransferFee: 0,
      purchaseFee: 0,
      ReceiveFee: 0,
    });

    return this.assetPolicyRepository.save(newAssetPolicy);
  }

  async updateAssetPolicy(
    assetFeePolicyId: string,
    updateAssetPolicyDTO: UpdateAssetPolicyDTO,
  ): Promise<AssetFeePolicy> {
    const assetPolicy = await this.assetPolicyRepository.findOne({
      where: {
        asset_fee_policy_id: assetFeePolicyId,
      },
    });

    if (!assetPolicy) {
      throw new NotFoundException(
        `Asset policy not found id ${assetFeePolicyId}`,
      );
    }

    Object.assign(assetPolicy, updateAssetPolicyDTO);

    return this.assetPolicyRepository.save(assetPolicy);
  }
}
