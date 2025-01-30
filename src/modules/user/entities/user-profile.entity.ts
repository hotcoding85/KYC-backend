import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Generated,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profile')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  profile_id: string;

  @Column({ nullable: true})
  image: string;

  @Column({ nullable: true, type: 'date' })
  dateRegistered: Date;

  @Column({ nullable: true, type: 'date' })
  dob: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ default: '' })
  phoneCountryCode: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  city: string;

  @Column({ default: '' })
  state: string;

  @Column({ default: '' })
  zip: string;

  @Column({ default: '' })
  country: string;

  @Column({ default: '' })
  nationality: string;

  @Column({ default: '' })
  verificationLink: string;

  @Column({ default: '' })
  username: string;

  @Column({ nullable: true, type: 'date' })
  usernameLastUpdated: Date;

  @OneToOne(() => User)
  user: User;
}
