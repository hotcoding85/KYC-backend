import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Company } from '../company/entities/company.entity';
import { UserProfile } from './entities/user-profile.entity';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { ActivityLog } from '../company-teams/entity/user-activity-logs.entity';
import { PrivateNotes } from '../private-notes/entity/private-notes.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Account } from '../account/entities/account.entity';
import { IbaneraProviderModule } from '../provider/ibanera/ibanera.module';
import { ThirteenxProviderModule } from '../provider/thirteenx/thirteenx.module';
import { AccountModule } from '../account/account.module';
import { AssetModule } from '../asset/asset.module';
import { FirebaseModule } from '../firebase/firebase.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Asset,
      Account,
      Company,
      UserProfile,
      ActivityLog,
      PrivateNotes,
    ]),
    forwardRef(() => AuthModule),
    CommonModule,
    ThirteenxProviderModule,
    IbaneraProviderModule,
    UserModule,
    AccountModule,
    AssetModule,
    FirebaseModule
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
