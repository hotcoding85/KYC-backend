import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  Generated,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from 'src/modules/vendor/entities/vendor.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('vendor_connection')
export class VendorConnection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  vendor_connection_id: string;
  
  @BeforeInsert()
  generateId() {
    this.vendor_connection_id = uuidv4();
  }

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  environment: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  curl: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  type: string;

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

  @Column({ default: false })
  status: boolean;

  @Column({ default: true })
  active: boolean; 

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;
}
