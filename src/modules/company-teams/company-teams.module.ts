import { Module } from '@nestjs/common';
import { CompanyTeamsController } from './company-teams.controller';
import { CompanyTeamsService } from './company-teams.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entity/user-permission.entity';
import { User } from '../user/entities/user.entity';
import { ActivityLog } from './entity/user-activity-logs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, User, ActivityLog]),
    UserModule,
  ],
  controllers: [CompanyTeamsController],
  providers: [CompanyTeamsService],
})
export class CompanyTeamsModule {}
