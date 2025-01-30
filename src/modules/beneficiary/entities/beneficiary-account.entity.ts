import { Beneficiary } from 'src/modules/beneficiary/entities/beneficiary.entity';
import { Asset } from 'src/modules/asset/entities/asset.entity';
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
  JoinColumn,
} from 'typeorm';

@Entity('beneficiary_account')
export class BeneficiaryAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  beneficiary_account_id: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  account_number: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  iban: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  account_detail: any;

  @ManyToOne(() => Beneficiary, (beneficiary) => beneficiary.id, {
    onDelete: 'CASCADE',
  })
  
  @JoinColumn({ name: 'beneficiary_id' })
  beneficiary: Beneficiary;

  @ManyToOne(() => Asset, (asset) => asset.beneficiary_accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => Network, (network) => network.beneficiary_accounts, {
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
