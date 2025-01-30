import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThirteenxProviderService } from './thirteenx.service';
import { CommonModule } from 'src/modules/common/common.module';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.WALLET_JWT_SECRET,
      signOptions: {
        expiresIn: '60s',
      },
    }),
    CommonModule,
  ],
  providers: [ThirteenxProviderService],
  exports: [ThirteenxProviderService],
})
export class ThirteenxProviderModule {}
