import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [MarketService],
  exports: [MarketService],
})
export class MarketModule {}
