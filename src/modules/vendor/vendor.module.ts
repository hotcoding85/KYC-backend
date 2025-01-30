import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Asset } from '../asset/entities/asset.entity';
import { VendorConnection } from '../vendor-connection/entities/vendor-connection.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor, Asset, VendorConnection]),
    CommonModule,
  ],
  providers: [VendorService],
  controllers: [VendorController],
})
export class VendorModule {}
