import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { ReferralEntity } from '../referral/referral.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
  @Column({ nullable: false, type: 'varchar' })
  username!: string | null;

  @Column({ nullable: false, type: 'varchar' })
  chatId!: string | null;

  @Column({ nullable: true, type: 'varchar', default: '' })
  wallet!: string | null;

  @Column({ nullable: true, type: 'varchar', default: '' })
  email!: string | null;

  @Column({ nullable: true, type: 'varchar', default: '0' })
  commission!: string | null;

  @Column({ nullable: true, type: 'bool' })
  isJoinChannel!: boolean | null;

  @Column({ nullable: true, type: 'bool' })
  isJoinCommunity!: boolean | null;

  @OneToMany(() => ReferralEntity, (ref) => ref.user)
  referrals!: ReferralEntity[];
}
