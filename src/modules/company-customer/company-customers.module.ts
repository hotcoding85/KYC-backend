import { Module } from '@nestjs/common';
import { CompanyCustomersController } from './company-customers.controller';
import { CompanyCustomersService } from './company-customers.service';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Permission } from '../company-teams/entity/user-permission.entity';
import { ActivityLog } from '../company-teams/entity/user-activity-logs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, User, ActivityLog]),
    UserModule,
  ],
  controllers: [CompanyCustomersController],
  providers: [CompanyCustomersService],
})
export class CompanyCustomersModule {}
