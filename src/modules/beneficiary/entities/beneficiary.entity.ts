import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  Generated,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BeneficiaryAccount } from './beneficiary-account.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('beneficiary')
export class Beneficiary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  beneficiary_id: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: '', nullable: true })
  nationality: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ['Individual', 'Business'], nullable: true })
  type: 'Individual' | 'Business';

  @Column({
    type: 'varchar',
    nullable: true,
  })
  country: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  avatar: string;

  @ManyToOne(() => User, (user) => user.beneficiaries, {
    onDelete: 'CASCADE',
  })

  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @Column({
    type: 'enum',
    enum: ['M', 'F'],
    default: 'M',
  })
  gender: 'M' | 'F';

  @Column({
    type: 'varchar',
    nullable: true,
  })
  phoneCountryCode: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  address: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  city: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  state: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  zip: string;

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

  @Column({ default: true })
  status: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(
    () => BeneficiaryAccount,
    (beneficiary_account) => beneficiary_account.beneficiary,
  )
  beneficiary_accounts: BeneficiaryAccount[];
}
