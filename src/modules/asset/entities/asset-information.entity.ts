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

@Entity('asset_information')
export class AssetInformation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  asset_information_id: string;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Minumum balance must be greater than 0' })
  minimumBalance: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Maximum balance must be greater than 0' })
  maximumBalance: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Minimum Transfer Amount must be greater than 0' })
  minimumTransferAmmount: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Minimum Transfer Amount must be greater than 0' })
  maximumTransferAmount: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Minimum Purchase Amount must be greater than 0' })
  minimumPurchaseAmount: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Maximum Purchase Amount must be greater than 0' })
  maximumPurchaseAmount: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Minimum Receive Amount must be greater than 0' })
  minimumReceiveAmount: number;

  @Column({ type: 'decimal', default: 0.0 })
  @Min(0, { message: 'Maximum Receive Amount must be greater than 0' })
  maximumReceiveAmount: number;

  @Column({ default: false })
  newAddressForEveryTransaction: boolean;

  @ManyToOne(() => Asset, (asset) => asset.assetInformation, {
    onDelete: 'CASCADE',
  })
  asset: Asset;

  @ManyToOne(() => Network, (network) => network.assetInformation, {
    onDelete: 'CASCADE',
  })
  network: Network;
}
