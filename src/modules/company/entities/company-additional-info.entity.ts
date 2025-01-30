import {
  Column,
  Entity,
  Generated,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('company-additional-info')
export class CompanyAdditionalInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  company_info_id: string;

  @Column()
  requestedInformationDetail: string;

  @Column()
  proofOfAddress: boolean;

  @Column()
  financialStatement: boolean;

  @Column()
  businessLicense: boolean;

  @Column()
  other: boolean;

  @Column({ default: '' })
  otherDescription: string;

  @OneToOne(() => Company)
  company: Company;
}
