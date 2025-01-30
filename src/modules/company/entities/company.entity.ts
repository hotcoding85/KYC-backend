import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  Generated,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { CompanyAdditionalInfo } from './company-additional-info.entity';
import { CompanyNode } from 'src/modules/company-node/entity/company-node.entity';
import { CompanyFeeScheme } from 'src/modules/company-fee-scheme/entity/company-fee-scheme.entity';
import { PrivateNotes } from 'src/modules/private-notes/entity/private-notes.entity';
import { COMPANY_ACCOUNT_TYPE } from 'src/lib/enums';
import { CompanyBranding } from 'src/modules/branding/entities/branding.entity';
import { SweepSchedule } from 'src/modules/asset-sweep-schedule/entity/sweep-schedule.entity';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  company_id: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  business_email: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  business_name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  phone_number: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  business_website: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  year_of_incorporation: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  trading_name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  address_line_one: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  address_line_two: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  country_of_incorporation: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  state: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  city: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  postal_code: string;

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

  @Column({
    type: 'enum',
    enum: COMPANY_ACCOUNT_TYPE,
    default: COMPANY_ACCOUNT_TYPE.WEB3,
  })
  company_account_type: COMPANY_ACCOUNT_TYPE;

  // Company has many users
  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @ManyToOne(() => Company, (company) => company.children, { nullable: true })
  @JoinColumn({ name: 'parent_company_id' })
  parent: Company;

  // Self-referencing relation for child companies
  @OneToMany(() => Company, (company) => company.parent)
  children: Company[];

  @OneToOne(() => CompanyAdditionalInfo, { nullable: true })
  @JoinColumn()
  additionalInfo: CompanyAdditionalInfo;

  @OneToOne(() => CompanyBranding, (branding) => branding.company)
  @JoinColumn()
  branding: CompanyBranding;

  @OneToMany(() => CompanyNode, (node) => node.company)
  nodes: CompanyNode[];

  @OneToMany(() => CompanyFeeScheme, (feeScheme) => feeScheme.company)
  feeSchemes: CompanyFeeScheme[];

  @OneToMany(() => SweepSchedule, (sweepSchedule) => sweepSchedule.company)
  sweepSchedule: SweepSchedule[];

  @OneToMany(() => PrivateNotes, (privateNote) => privateNote.company)
  privateNotes: PrivateNotes[];
}
