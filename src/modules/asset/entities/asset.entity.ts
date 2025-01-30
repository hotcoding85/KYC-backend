import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  Generated,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Vendor } from 'src/modules/vendor/entities/vendor.entity';
import { AssetInformation } from './asset-information.entity';
import { Network } from 'src/modules/asset-networks/entity/networks.entity';
import { Account } from 'src/modules/account/entities/account.entity';
import { ASSET_TYPE } from 'src/lib/enums';
import { BeneficiaryAccount } from 'src/modules/beneficiary/entities/beneficiary-account.entity';
import { AssetProtocol } from './asset-protocol.entity';
import { SweepSchedule } from 'src/modules/asset-sweep-schedule/entity/sweep-schedule.entity';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  asset_id: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  ticker: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  country: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  icon: string;

  @Column({
    type: 'float',
    nullable: true,
  })
  usd_value: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  daily_volume: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  denomination: number;

  @Column({
    type: 'enum',
    enum: ASSET_TYPE,
    default: ASSET_TYPE.CRYPTOCURRENCY,
  })
  type: ASSET_TYPE;

  @ManyToMany(() => Vendor, (vendor) => vendor.assets, {
    cascade: true,
  })
  @JoinTable({
    name: 'asset_vendors',
    joinColumn: { name: 'asset_id', referencedColumnName: 'asset_id' },
    inverseJoinColumn: { name: 'vendor_id', referencedColumnName: 'vendor_id' },
  })
  liquidity: Vendor[];

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  created_at: Date;

  @BeforeInsert()
  setCreationDate() {
    this.created_at = new Date();
  }

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated_at = new Date();
  }

  @Column({ default: false })
  status: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => Network, (network) => network.asset, {
    cascade: true,
  })
  networks: Network[];

  @OneToMany(() => AssetInformation, (assetInfo) => assetInfo.asset)
  assetInformation: AssetInformation[];

  @OneToMany(() => AssetProtocol, (assetProto) => assetProto.asset)
  assetProtocol: AssetProtocol[];

  @OneToMany(() => SweepSchedule, (sweepSchedule) => sweepSchedule.asset)
  sweepSchedule: SweepSchedule[];

  @OneToMany(() => Account, (account) => account.asset)
  accounts: Account[];

  @OneToMany(
    () => BeneficiaryAccount,
    (beneficiary_account) => beneficiary_account.asset,
  )
  beneficiary_accounts: BeneficiaryAccount[];
}
