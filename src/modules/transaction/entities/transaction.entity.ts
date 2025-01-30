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
  VersionColumn,
  JoinColumn,
} from 'typeorm';
import { Account } from 'src/modules/account/entities/account.entity';

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  transaction_id: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  transaction_number: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  transaction_detail: string;

  @Column({ type: 'decimal', precision: 28, scale: 18, default: 0 })
  amount: number;

  // @ManyToOne(() => User, (user) => user.transactions)
  // origin: User;

  // @ManyToOne(() => Account, (account) => account.transactions)
  // account: Account;
  @ManyToOne(() => User, (user) => user.transaction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Account, (account) => account.transaction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Network, (network) => network.transactions, {
    nullable: true,
  })
  network: Network;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  usd_rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  fee_usd_rate: number;

  @Column({ type: 'enum', enum: ['credit', 'debit'] })
  type: 'credit' | 'debit';

  @Column({ type: 'enum', enum: ['internal', 'external', 'sweep'] })
  transactionType: 'internal' | 'external' | 'sweep';

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  chain_fee?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  platform_fee?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  company_fee?: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'failed';

  @Column({ type: 'boolean', default: false })
  is_delegate: boolean;

  @Column({ type: 'boolean', default: false })
  is_sweep: boolean;

  @Column({ type: 'boolean', default: false })
  is_gas: boolean;

  @VersionColumn()
  version: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @UpdateDateColumn({ nullable: true })
  confirmed_at?: Date;
}
