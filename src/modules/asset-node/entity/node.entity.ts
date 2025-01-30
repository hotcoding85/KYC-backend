import { uuid } from 'aws-sdk/clients/customerprofiles';
import { NODE_NETWORK_TYPE } from 'src/lib/enums';
import { Network } from 'src/modules/asset-networks/entity/networks.entity';
import {
  BeforeUpdate,
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('node')
export class Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  node_id: uuid;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
  })
  ipAddress: string;

  @Column({
    type: 'varchar',
  })
  rpcPort: string;

  @Column({
    type: 'varchar',
  })
  userName: string;

  @Column({
    type: 'varchar',
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  webSocketPort: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  webSocketAddress: string;

  @Column({
    type: 'enum',
    enum: NODE_NETWORK_TYPE,
    default: NODE_NETWORK_TYPE.TEST_NET,
  })
  networkType: NODE_NETWORK_TYPE;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  adminPannelPort: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  noOfWallet: string;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  created_at: Date;

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

  @ManyToOne(() => Network, (network) => network.nodes, { onDelete: 'CASCADE' })
  network: Network;
}
