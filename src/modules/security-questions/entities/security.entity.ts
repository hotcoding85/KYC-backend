import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('security_questions')
export class SecurityQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number; // Assuming each user has their own set of questions

  @Column()
  question1: string;

  @Column()
  answer1: string;

  @Column()
  question2: string;

  @Column()
  answer2: string;

  @Column()
  question3: string;

  @Column()
  answer3: string;
}
