import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { CommonModule } from '../common/common.module';
import { MarketModule } from '../market/market.module';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Network } from '../asset-networks/entity/networks.entity';
import { IbaneraProviderModule } from '../provider/ibanera/ibanera.module';
import { ThirteenxProviderModule } from '../provider/thirteenx/thirteenx.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Card, Company, Asset, Network, User]),
    ThirteenxProviderModule,
    IbaneraProviderModule,
    CommonModule,
    MarketModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [CardService],
  controllers: [CardController],
  exports: [CardService],
})
export class CardModule {}
