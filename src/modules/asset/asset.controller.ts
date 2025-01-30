import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  Put,
  Param,
  Patch,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { Asset } from './entities/asset.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CheckAssetDto } from './dto/check-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateAssetInfoDTO } from './dto/update-asset-info.dto';
import { UpdateAssetPolicyDTO } from './dto/update-policy.dto';
import { UpdateAssetProtocolDTO } from './dto/update-asset-protocol.dto';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async listAssets(): Promise<Asset[]> {
    const assets = await this.assetService.findAll();
    return assets;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:assetId')
  async getAssetById(@Param('assetId') assetId: string) {
    return await this.assetService.getAssetById(assetId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetService.create(createAssetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('check')
  async check(@Body() checkAssetDto: CheckAssetDto) {
    return this.assetService.check(checkAssetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':asset_id')
  async update(@Param('asset_id') assetId: string, @Body() body: any) {
    const updateAssetDto = plainToInstance(UpdateAssetDto, body, {
      excludeExtraneousValues: true,
    });
    return this.assetService.update(assetId, updateAssetDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/asset-info/:assetId/:networkId')
  async getOrCreateAssetInfo(
    @Param('assetId') assetId: string,
    @Param('networkId') networkId: string,
  ) {
    return this.assetService.getOrCreateAssetInfo(assetId, networkId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/asset-info/:assetId/:networkId')
  async updateAssetInfo(
    @Param('assetId') assetId: string,
    @Param('networkId') networkId: string,
    @Body() updateAssetInfoDto: UpdateAssetInfoDTO,
  ) {
    return this.assetService.editAssetInfo(
      assetId,
      networkId,
      updateAssetInfoDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/asset-protocol/:assetId/:networkId')
  async getOrCreateAssetProtocol(
    @Param('assetId') assetId: string,
    @Param('networkId') networkId: string,
  ) {
    return this.assetService.getOrCreateAssetProtocol(assetId, networkId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/asset-protocol/:assetId/:networkId')
  async updateAssetProtocol(
    @Param('assetId') assetId: string,
    @Param('networkId') networkId: string,
    @Body() updateAssetInfoDto: UpdateAssetProtocolDTO,
  ) {
    return this.assetService.editAssetProtocol(
      assetId,
      networkId,
      updateAssetInfoDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/asset-policy/:networkId')
  async getOrCreateAssetPolicy(@Param('networkId') networkId: string) {
    return this.assetService.getOrCreateAssetPolicy(networkId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/asset-policy/:assetFeePolicyId')
  async updateAssetPolicy(
    @Param('assetFeePolicyId') assetFeePolicyId: string,
    @Body() updateAssetPolicyDto: UpdateAssetPolicyDTO,
  ) {
    return this.assetService.updateAssetPolicy(
      assetFeePolicyId,
      updateAssetPolicyDto,
    );
  }
}
