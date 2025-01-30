import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AssetModule } from '../asset/asset.module';
import { AccountModule } from '../account/account.module';
import { CommonModule } from '../common/common.module';
import { User } from '../user/entities/user.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Account } from '../account/entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { IbaneraProviderModule } from '../provider/ibanera/ibanera.module';
import { ThirteenxProviderModule } from '../provider/thirteenx/thirteenx.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.constants';
@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User, Asset, Account]),
    ThirteenxProviderModule,
    IbaneraProviderModule,
    AuthModule,
    AssetModule,
    AccountModule,
    UserModule,
    CommonModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
