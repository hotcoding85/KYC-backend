// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SweepScheduleService } from './sweep-schedule.service';
import { SweepScheduleController } from './sweep-schedule.controller';
import { SweepSchedule } from './entity/sweep-schedule.entity';
import { Network } from '../asset-networks/entity/networks.entity';
import { Asset } from '../asset/entities/asset.entity';
@Module({
  imports: [TypeOrmModule.forFeature([SweepSchedule, Network, Asset])],
  controllers: [SweepScheduleController],
  providers: [SweepScheduleService],
})
export class SweepScheduleModule {}
