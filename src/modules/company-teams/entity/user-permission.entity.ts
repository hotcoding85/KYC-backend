import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  Generated,
} from 'typeorm';

@Entity('permission')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  permission_id: string;

  @OneToOne(() => User, (user) => user.permission)
  user: User;

  @Column({ default: false })
  userAccess: boolean;

  @Column({ default: false })
  viewUsers: boolean;

  @Column({ default: false })
  editUsers: boolean;

  @Column({ default: false })
  deleteUsers: boolean;

  @Column({ default: false })
  blockUsers: boolean;

  @Column({ default: false })
  roleManagement: boolean;

  @Column({ default: false })
  createRoles: boolean;

  @Column({ default: false })
  assignRoles: boolean;

  @Column({ default: false })
  editRoles: boolean;

  @Column({ default: false })
  transactions: boolean;

  @Column({ default: false })
  viewTransactions: boolean;

  @Column({ default: false })
  approveTransactions: boolean;

  @Column({ default: false })
  exportTransactions: boolean;

  @Column({ default: false })
  reports: boolean;

  @Column({ default: false })
  viewReports: boolean;

  @Column({ default: false })
  downloadReports: boolean;

  @Column({ default: false })
  generateReports: boolean;

  @Column({ default: false })
  generalSettings: boolean;

  @Column({ default: false })
  editGeneralSettings: boolean;

  @Column({ default: false })
  changePlatformPreferences: boolean;

  @Column({ default: false })
  security: boolean;

  @Column({ default: false })
  manageSecuritySettings: boolean;

  @Column({ default: false })
  viewSecurityLogs: boolean;
}
