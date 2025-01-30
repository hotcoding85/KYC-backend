import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NetworksService } from './networks.service';
import { CreateNetworkDto } from './dto/create-network.dto';
import { UpdateNetworkDto } from './dto/update-network.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('networks')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createNetwork(@Body() createNetworkDto: CreateNetworkDto) {
    return this.networksService.createNetwork(createNetworkDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('asset/:assetId')
  async getNetworksByAssetId(@Param('assetId') assetId: string) {
    return this.networksService.getNetworksByAssetId(assetId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getNetworkById(@Param('id') id: string) {
    const network = await this.networksService.getNetworkById(id);
    if (!network) {
      throw new NotFoundException(`Network with ID "${id}" not found`);
    }
    return network;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateNetwork(
    @Param('id') id: string,
    @Body() updateNetworkDto: UpdateNetworkDto,
  ) {
    return this.networksService.updateNetwork(id, updateNetworkDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteNetwork(@Param('id') id: string) {
    return this.networksService.deleteNetwork(id);
  }
}
