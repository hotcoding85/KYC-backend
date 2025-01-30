import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  Generated,
  ManyToMany,
} from 'typeorm';
import { VendorConnection } from 'src/modules/vendor-connection/entities/vendor-connection.entity';
import { Asset } from 'src/modules/asset/entities/asset.entity';
import { VENDOR_TYPE } from 'src/lib/enums';

@Entity('vendor')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  vendor_id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: VENDOR_TYPE,
    nullable: true,
  })
  type: VENDOR_TYPE;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  logo: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  website: string;

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

  @ManyToMany(() => Asset, (asset) => asset.liquidity)
  assets: Asset[];

  @OneToMany(
    () => VendorConnection,
    (vendorConnection) => vendorConnection.vendor,
  )
  vendor_connections: VendorConnection[];
}
