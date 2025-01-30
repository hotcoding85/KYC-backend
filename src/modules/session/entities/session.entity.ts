import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('session')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.sessions)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @CreateDateColumn()
  created: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires: Date;

  @Column()
  source: string;

  @Column()
  ip: string;

  @Column()
  platform: string;

  @Column()
  browser: string;

  @Column()
  device_type: string;

  @Column()
  maker: string;

  @Column()
  model: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  latitude: string;

  @Column()
  longitude: string;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  otp_token: string;

  @Column({ default: false })
  isRevoked: boolean;
}
