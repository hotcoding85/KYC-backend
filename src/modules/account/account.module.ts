import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { CommonModule } from '../common/common.module';
import { MarketModule } from '../market/market.module';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { Network } from '../asset-networks/entity/networks.entity';
import { IbaneraProviderModule } from '../provider/ibanera/ibanera.module';
import { ThirteenxProviderModule } from '../provider/thirteenx/thirteenx.module';
import { AccountWatcherService } from './account-watcher.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Company,
      Asset,
      Network,
      User,
      Transaction,
    ]),
    ThirteenxProviderModule,
    IbaneraProviderModule,
    CommonModule,
    MarketModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AccountService, AccountWatcherService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
