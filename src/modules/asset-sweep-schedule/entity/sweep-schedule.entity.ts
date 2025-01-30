// sweep-schedule.entity.ts
import { FEE_SCHEME_CRITERIA_COMPARASION } from 'src/lib/enums';
import { Network } from 'src/modules/asset-networks/entity/networks.entity';
import { Asset } from 'src/modules/asset/entities/asset.entity';
import { Company } from 'src/modules/company/entities/company.entity';
import { Entity, PrimaryGeneratedColumn, Column, Generated, ManyToOne, OneToOne } from 'typeorm';

@Entity('asset_sweep_schedules')
export class SweepSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  sweep_schedule_id: string;

  @Column()
  scheduleOn: string; 

  @Column()
  repeat: string; 

  @Column()
  duration: string; 

  @Column('simple-json')
  rules: {
    comparasion: FEE_SCHEME_CRITERIA_COMPARASION;
    value: string;
  }[];

  @ManyToOne(() => Asset, (asset) => asset.sweepSchedule, {
    onDelete: 'CASCADE',
  })
  asset: Asset;

  @ManyToOne(() => Network, (network) => network.sweepSchedule, {
    onDelete: 'CASCADE',
  })
  network: Network;

  @ManyToOne(() => Company, (company) => company.sweepSchedule, {
    onDelete: 'CASCADE',
  })
  company: Company;
}
