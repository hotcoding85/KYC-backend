import { Company } from 'src/modules/company/entities/company.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('private-notes')
@Unique(['user', 'company'])
export class PrivateNotes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  private_note_id: string;

  @ManyToOne(() => User, (user) => user.privateNotes)
  user: User;

  @ManyToOne(() => Company, (company) => company.privateNotes)
  company: Company;
}
