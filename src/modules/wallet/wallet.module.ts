import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { ThirteenxProviderModule } from '../provider/thirteenx/thirteenx.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ThirteenxProviderModule, AuthModule, UserModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
