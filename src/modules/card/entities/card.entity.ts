import { Asset } from 'src/modules/asset/entities/asset.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Network } from 'src/modules/asset-networks/entity/networks.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { CARD_TYPE } from 'src/lib/enums';


@Entity('card')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid', { unique: true })
  @Generated('uuid')
  card_id: string;

  @Column({
    type: 'enum',
    enum: CARD_TYPE,
    default: CARD_TYPE.VIRTUAL,
  })
  type: CARD_TYPE;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  card_number: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  card_detail: string;

  @Column({ type: 'decimal', precision: 28, scale: 18, default: 0 })
  balance: number;

  @ManyToOne(() => User, (user) => user.cards)
  user: User;

  @ManyToOne(() => Asset, (asset) => asset.accounts)
  asset: Asset;

  @ManyToOne(() => Network, (network) => network.accounts, { nullable: true })
  network: Network;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
