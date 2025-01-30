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
import { VendorService } from './vendor.service';
import { Vendor } from './entities/vendor.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VENDOR_TYPE } from 'src/lib/enums';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @UseGuards(JwtAuthGuard)
  @Get('type/:type')
  async getVendorByType(@Param('type') type: VENDOR_TYPE): Promise<Vendor[]> {
    const vendors = await this.vendorService.findByType(type);
    return vendors;
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async createVendor(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorService.createVendor(createVendorDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:vendorId')
  async updateVendor(
    @Body() updateVendorDto: UpdateVendorDto,
    @Param('vendorId') vendorId: string,
  ) {
    return this.vendorService.updateVendor(updateVendorDto, vendorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getVendorById(@Param('id') vendorId: string) {
    return this.vendorService.getVendorById(vendorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/asset/:id')
  async getVendorByAssetId(@Param('id') assetId: string) {
    return this.vendorService.getVendorByAssetId(assetId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteVendor(@Param('id') vendorId: string) {
    return this.vendorService.deleteVendor(vendorId);
  }
}
