import { AssetFeeScheme } from 'src/modules/asset-fee-scheme/entity/asset-fee-scheme.entity';
import { AssetInformation } from 'src/modules/asset/entities/asset-information.entity';
import { AssetFeePolicy } from 'src/modules/asset/entities/asset-policy.entity';
import { Asset } from 'src/modules/asset/entities/asset.entity';
import { Account } from 'src/modules/account/entities/account.entity';
import { Node } from 'src/modules/asset-node/entity/node.entity';
import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';
import { BeneficiaryAccount } from 'src/modules/beneficiary/entities/beneficiary-account.entity';
import { AssetProtocol } from 'src/modules/asset/entities/asset-protocol.entity';
import { SweepSchedule } from 'src/modules/asset-sweep-schedule/entity/sweep-schedule.entity';

@Entity('networks')
export class Network {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  network_id: string;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  icon: string;
  
  @ManyToOne(() => Asset, (asset) => asset.networks, { onDelete: 'CASCADE' })
  asset: Asset;

  @OneToMany(() => Node, (node) => node.network)
  nodes: Node[];

  @OneToMany(() => AssetInformation, (assetInfo) => assetInfo.network)
  assetInformation: AssetInformation[];
  
  @OneToMany(() => AssetProtocol, (assetProto) => assetProto.network)
  assetProtocol: AssetProtocol[];

  @OneToMany(() => SweepSchedule, (sweepSchedule) => sweepSchedule.network)
  sweepSchedule: SweepSchedule[];

  @OneToMany(() => AssetFeePolicy, (assetPolicy) => assetPolicy.network)
  assetFeePolicy: AssetFeePolicy[];

  @OneToMany(() => AssetFeeScheme, (feeScheme) => feeScheme.network)
  feeSchemes: AssetFeeScheme[];

  @OneToMany(() => Account, (account) => account.network)
  accounts: Account[];


  @OneToMany(
    () => BeneficiaryAccount,
    (beneficiary_account) => beneficiary_account.asset,
  )
  beneficiary_accounts: BeneficiaryAccount[];
  
  @OneToMany(() => Transaction, (transaction) => transaction.network)
  transactions: Transaction[];
}
