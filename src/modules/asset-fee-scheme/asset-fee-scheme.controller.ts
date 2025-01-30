import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FeeSchemeService } from './asset-fee-scheme.service';
import { CreateFeeSchemeDto } from './dto/create-fee-scheme.dto';
import { UpdateFeeSchemeDto } from './dto/update-fee-scheme.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('asset-fee-scheme')
export class FeeSchemeController {
  constructor(private readonly feeSchemeService: FeeSchemeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFeeSchemeDto: CreateFeeSchemeDto) {
    return this.feeSchemeService.create(createFeeSchemeDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // findAll(@Query('asset_id') asset_id: string) {
  //   return this.feeSchemeService.findAll(asset_id);
  // }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feeSchemeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFeeSchemeDto: UpdateFeeSchemeDto,
  ) {
    return this.feeSchemeService.update(id, updateFeeSchemeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feeSchemeService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/network/:networkId')
  getByAssetId(@Param('networkId') networkId: string) {
    return this.feeSchemeService.getByNetworkId(networkId);
  }
}
