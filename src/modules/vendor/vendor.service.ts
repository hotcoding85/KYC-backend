import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { VENDOR_TYPE } from 'src/lib/enums';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { Asset } from '../asset/entities/asset.entity';
import { VendorConnection } from '../vendor-connection/entities/vendor-connection.entity';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UtilityService } from '../common/utility/utility.service';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(VendorConnection)
    private readonly vendorConnectionRepository: Repository<VendorConnection>,

    private utilityService: UtilityService,
  ) {}

  async findByType(type: VENDOR_TYPE): Promise<Vendor[]> {
    return await this.vendorRepository.find({
      where: { type },
    });
  }

  async createVendor(createVendorDto: CreateVendorDto) {
    const { assetIds, vendorConnectionIds, logo, ...vendorData } =
      createVendorDto;

    const newVendor = await this.vendorRepository.create(vendorData);
    if (assetIds && assetIds.length > 0) {
      const assets = await this.assetRepository.find({
        where: {
          asset_id: In(assetIds),
        },
      });
      if (assetIds.length !== assets.length) {
        throw new NotFoundException(`Some of assets were not found`);
      }
      newVendor.assets = assets;
    }

    if (vendorConnectionIds && vendorConnectionIds.length > 0) {
      const vendorConnections = await this.vendorConnectionRepository.find({
        where: {
          vendor_connection_id: In(vendorConnectionIds),
        },
      });

      newVendor.vendor_connections = vendorConnections;
    }

    if (logo) {
      const extensionMatch = logo.match(/\/(.*?);base64,/);
      const extension = extensionMatch ? extensionMatch[1] : 'png'; // default to 'png' if no match

      // Create a file name with the extension
      const fileName = `${createVendorDto.name}_${Date.now()}.${extension}`;

      // Remove the Base64 prefix
      const base64Data = logo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const path = await this.utilityService.uploadToS3(
        'watpay',
        `assets/${fileName}`,
        buffer,
      );

      newVendor.logo = path.Location;
    }

    return this.vendorRepository.save(newVendor);
  }

  async updateVendor(updateVendorDto: UpdateVendorDto, vendorId: string) {
    const { assetIds, vendorConnectionIds, logo, ...vendorData } =
      updateVendorDto;

    const existingVendor = await this.vendorRepository.findOne({
      where: { vendor_id: vendorId },
    });

    if (!existingVendor) {
      throw new NotFoundException(`Vendor with id ${vendorId} does not exists`);
    }

    Object.keys(vendorData).forEach((key) => {
      if (vendorData[key] !== undefined && vendorData[key] !== null) {
        existingVendor[key] = vendorData[key];
      }
    });

    if (assetIds && assetIds.length > 0) {
      await this.vendorRepository
        .createQueryBuilder()
        .relation(Vendor, 'asset')
        .of(existingVendor)
        .remove(existingVendor.assets);

      const assets = await this.assetRepository.find({
        where: {
          asset_id: In(assetIds),
        },
      });

      existingVendor.assets = assets;
    }

    if (vendorConnectionIds && vendorConnectionIds.length > 0) {
      await this.vendorRepository
        .createQueryBuilder()
        .relation(Vendor, 'vendor_connections')
        .of(existingVendor)
        .remove(existingVendor.vendor_connections);

      const vendorConnections = await this.vendorConnectionRepository.find({
        where: {
          vendor_connection_id: In(vendorConnectionIds),
        },
      });

      existingVendor.vendor_connections = vendorConnections;
    }

    if (logo && existingVendor.logo !== logo) {
      if (existingVendor.logo) {
        await this.utilityService.deleteImageByUrl(existingVendor.logo);
      }
      const extensionMatch = logo.match(/\/(.*?);base64,/);
      const extension = extensionMatch ? extensionMatch[1] : 'png'; // default to 'png' if no match

      // Create a file name with the extension
      const fileName = `${existingVendor.name}_${Date.now()}.${extension}`;

      // Remove the Base64 prefix
      const base64Data = logo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const path = await this.utilityService.uploadToS3(
        'watpay',
        `assets/${fileName}`,
        buffer,
      );

      existingVendor.logo = path.Location;
    }

    return this.vendorRepository.save(existingVendor);
  }

  async getVendorById(vendorId: string) {
    return this.vendorRepository.find({
      where: {
        vendor_id: vendorId,
      },
      relations: {
        assets: true,
        vendor_connections: true,
      },
    });
  }

  async getVendorByAssetId(assetId: string) {
    return this.vendorRepository.find({
      where: {
        assets: {
          asset_id: assetId,
        },
      },
    });
  }

  async deleteVendor(vendorId: string) {
    const vendor = await this.vendorRepository.findOne({
      where: {
        vendor_id: vendorId,
      },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with id ${vendorId} does not exists`);
    }

    vendor.deleted = true;
    return this.vendorRepository.save(vendor);
  }
}
