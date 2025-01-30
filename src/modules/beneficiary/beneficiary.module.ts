import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beneficiary } from './entities/beneficiary.entity';
import { BeneficiaryAccount } from './entities/beneficiary-account.entity';
import { BeneficiaryService } from './beneficiary.service';
import { BeneficiaryController } from './beneficiary.controller';
import { CommonModule } from '../common/common.module';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.constants';
import { Asset } from '../asset/entities/asset.entity';
import { Network } from '../asset-networks/entity/networks.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Beneficiary, BeneficiaryAccount, User, Asset, Network]),
    CommonModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [BeneficiaryService],
  controllers: [BeneficiaryController],
  exports: [BeneficiaryService],
})
export class BeneficiaryModule {}
