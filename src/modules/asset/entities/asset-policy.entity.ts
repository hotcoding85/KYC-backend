import { Min } from 'class-validator';
import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Network } from 'src/modules/asset-networks/entity/networks.entity';

@Entity('asset_fee_policy')
export class AssetFeePolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  asset_fee_policy_id: string;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Internal transfer fee must be greater than 0' })
  internalTransferFee: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'External transfer fee should be greater than 0' })
  externalTransferFee: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Purchase fee should be greater than 0' })
  purchaseFee: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Receive fee should be greater than 0' })
  ReceiveFee: number;

  @ManyToOne(() => Network, (network) => network.assetFeePolicy)
  network: Network;
}
