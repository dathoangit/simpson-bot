import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'referrals' })
export class ReferralEntity extends AbstractEntity {
  @Column({ nullable: true })
  referral!: string;

  @ManyToOne(() => UserEntity, (user) => user.referrals, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user!: UserEntity;
}
