import {
  FEE_SCHEME_ACTIVITY,
  FEE_SCHEME_CRITERIA_COMPARASION,
  FEE_SCHEME_CRITERIA_TYPE,
  FEE_SCHEME_FEE_TYPE,
  FEE_SCHEME_GAS_PRICE_TYPE,
} from 'src/lib/enums';
import { Company } from 'src/modules/company/entities/company.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Generated,
  BeforeInsert,
} from 'typeorm';

@Entity('company_fee_scheme')
export class CompanyFeeScheme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  fee_scheme_id: string;

  @Column({
    type: 'enum',
    enum: FEE_SCHEME_ACTIVITY,
    default: FEE_SCHEME_ACTIVITY.BUY,
  })
  activity: FEE_SCHEME_ACTIVITY;

  @Column({
    type: 'enum',
    enum: FEE_SCHEME_FEE_TYPE,
    default: FEE_SCHEME_FEE_TYPE.AMOUNT,
  })
  feeType: FEE_SCHEME_FEE_TYPE;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  fee: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  assetType: string;

  @Column({ type: 'date' })
  startTime: Date;

  @Column({ type: 'date' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: FEE_SCHEME_GAS_PRICE_TYPE,
    default: FEE_SCHEME_GAS_PRICE_TYPE.AMOUNT,
  })
  gasPriceType: FEE_SCHEME_GAS_PRICE_TYPE;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  gasPrice: number;

  @Column('simple-json')
  criteria: {
    criteria: FEE_SCHEME_CRITERIA_TYPE;
    comparasion: FEE_SCHEME_CRITERIA_COMPARASION;
    value: string;
  }[];

  @Column('varchar')
  rules: string;

  @ManyToOne(() => Company, (company) => company.feeSchemes, {
    onDelete: 'CASCADE',
  })
  company: Company;

  
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
}
