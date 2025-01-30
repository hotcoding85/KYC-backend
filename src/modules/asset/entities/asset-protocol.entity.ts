import { Min } from 'class-validator';
import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Network } from 'src/modules/asset-networks/entity/networks.entity';
import { EOA_SCHEDULE } from 'src/lib/enums';

@Entity('asset_protocol')
export class AssetProtocol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  asset_protocol_id: string;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Minumum Sweep Amount must be greater than 0' })
  minimumSweepAmount: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Maximum Sweep Amount must be greater than 0' })
  maximumSweepAmount: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Maximum EOA Limit must be greater than 0' })
  maximumEOALimit: number;

  @Column({ default: false })
  sweepEOA: boolean;

  @Column({ default: false })
  useEOAAdress: boolean;

  @Column({ default: false })
  internalEOATransaction: boolean;

  @Column({ default: false })
  newAddressForEveryTransaction: boolean;

  @Column({
    type: 'enum',
    enum: EOA_SCHEDULE,
    default: EOA_SCHEDULE.Daily,
  })
  sweepEOASchedule: EOA_SCHEDULE;

  @ManyToOne(() => Asset, (asset) => asset.assetProtocol, {
    onDelete: 'CASCADE',
  })
  asset: Asset;

  @ManyToOne(() => Network, (network) => network.assetProtocol, {
    onDelete: 'CASCADE',
  })
  network: Network;
}
