import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserSettings } from './entities/setting.entity';
import { SettingsService } from './setting.service';
import { SettingsController } from './setting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserSettings, User])],
  providers: [SettingsService],
  controllers: [SettingsController],
})
export class SettingsModule {}
