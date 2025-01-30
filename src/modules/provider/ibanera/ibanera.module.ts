import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { IbaneraProviderService } from './ibanera.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.WALLET_JWT_SECRET,
      signOptions: {
        expiresIn: '60s',
      },
    }),
  ],
  providers: [IbaneraProviderService],
  exports: [IbaneraProviderService],
})
export class IbaneraProviderModule {}
