import { Company } from 'src/modules/company/entities/company.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

@Entity('company_branding')
export class CompanyBranding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  logo: string; // Path or URL for logo

  @Column({ nullable: true })
  icon: string; // Path or URL for icon

  @Column({ nullable: true })
  theme: string; // Selected theme option

  @Column({ nullable: true })
  customCss: string; // Path to custom CSS file

  @Column({ nullable: true })
  appStyle: string; // Path to app style file

  // @Column()
  // companyId: string; // Reference to company

  @OneToOne(() => Company, (company) => company.branding, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
