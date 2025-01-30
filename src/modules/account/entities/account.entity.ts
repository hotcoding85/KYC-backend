import { Asset } from 'src/modules/asset/entities/asset.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Network } from 'src/modules/asset-networks/entity/networks.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from 'src/modules/transaction/entities/transaction.entity';

@Entity('account')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  account_id: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  account_number: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  account_detail: any;

  @Column({ type: 'decimal', precision: 28, scale: 18, default: 0 })
  balance: number;

  @ManyToOne(() => User, (user) => user.accounts)
  user: User;

  @ManyToOne(() => Asset, (asset) => asset.accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transaction: Asset;

  @ManyToOne(() => Network, (network) => network.accounts, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'network_id' })
  network: Network;

  @CreateDateColumn()
  created_at: Date;
 
  @UpdateDateColumn()
  updated_at: Date;
}
