import { User } from 'src/modules/user/entities/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column({ default: false })
  allNotifications: boolean;

  @Column({ default: false })
  news: boolean;

  @Column({ default: false })
  promotions: boolean;

  @Column({ default: 'English' })
  preferredLanguage: string;

  @Column({ default: 'USD' }) // Default currency can be USD or any other
  preferredCurrency: string;
}