import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Generated,
} from 'typeorm';
@Entity('activity_log')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  activity_id: string;

  @CreateDateColumn({ name: 'date_time' })
  dateTime: Date;

  @Column({ name: 'activity_type' })
  activityType: string;

  @Column()
  status: string;

  @Column()
  details: string;

  @Column({ name: 'ip_address' })
  ipAddress: string;

  @Column({ name: 'device_browser' })
  deviceBrowser: string;

  @ManyToOne(() => User, (user) => user.activityLogs)
  user: User;
}
