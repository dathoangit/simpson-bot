/* eslint-disable max-len,eqeqeq,no-await-in-loop,@typescript-eslint/no-unnecessary-condition */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BigNumber } from 'ethers';
import { expandDecimals } from 'src/common/utils';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { AirdropAmount } from '../../constants/airdrop';
import { ReferralService } from '../referral/referral.service';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private referralService: ReferralService,
  ) {}

  /**
   * Find single user
   */
  findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return this.userRepository.findOneBy(findData);
  }

  async getOrCreate(args: { chatId: any; username: any }) {
    let u = await this.userRepository.findOne({
      where: {
        chatId: args.chatId,
      },
    });

    if (!u) {
      u = this.userRepository.create({
        username: args.username,
        chatId: args.chatId,
      });
      await this.userRepository.save(u);
    }

    return u;
  }

  async getInfo(chatId: any) {
    const [u] = await Promise.all([
      this.userRepository.findOne({
        where: {
          chatId,
        },
        relations: {
          referrals: true,
        },
      }),
    ]);

    if (!u) {
      return {
        balance: expandDecimals(0, 18),
        friends: 0,
        commission: 0,
        u: null,
      };
    }

    return {
      balance: BigNumber.from(u.commission),
      friends: Math.max(u.referrals.length, 0),
      commission: u.commission,
      u,
    };
  }

  async updateUser(
    chatId: any,
    update: {
      isJoinChannel?: boolean;
      isJoinCommunity?: boolean;
      wallet?: string;
      email?: string;
    },
  ) {
    const u = await this.userRepository.findOne({
      where: {
        chatId,
      },
    });

    if (!u) {
      return;
    }

    if (
      update.isJoinChannel != null &&
      update.isJoinCommunity != null &&
      (!u.isJoinChannel || !u.isJoinCommunity) &&
      update.isJoinChannel &&
      update.isJoinCommunity
    ) {
      await this.updateCommission(
        chatId,
        AirdropAmount.COMMUNITY,
        update.isJoinChannel,
      );
      // await this.updateTotalAirdrop(update.isJoinChannel);
    }

    await this.userRepository.update(
      {
        chatId,
      },
      update,
    );
  }

  async updateCommission(
    chatId: any,
    amount = AirdropAmount.COMMUNITY,
    isIncrease = true,
  ) {
    const u = await this.userRepository.findOne({
      where: {
        chatId,
      },
    });

    if (!u) {
      return;
    }

    let newCom = BigNumber.from(u.commission);

    if (isIncrease) {
      newCom = newCom.add(amount);
    } else {
      newCom = newCom.gt(amount) ? newCom.sub(amount) : BigNumber.from(0);
    }

    await this.userRepository.update(
      {
        chatId,
      },
      {
        commission: newCom.toString(),
      },
    );
  }

  async sync() {
    const users = await this.userRepository.find({
      relations: {
        referrals: true,
      },
    });
    let sum = BigNumber.from(0);

    for (const user of users) {
      const f = await this.referralService.findOne(user.chatId as any);
      let commission = BigNumber.from(0);

      if (user.isJoinChannel) {
        commission = commission.add(AirdropAmount.CHANNEL);
      }

      if (user.isJoinChannel) {
        commission = commission.add(AirdropAmount.CHANNEL);
      }

      if (user.referrals) {
        commission = commission.add(
          AirdropAmount.INVITE.mul(user.referrals.length),
        );
      }

      if (f) {
        commission = commission.add(AirdropAmount.INVITE);
      }

      await this.userRepository.update(
        {
          id: user.id,
        },
        {
          commission: commission.toString(),
        },
      );
      sum = sum.add(commission);
    }
  }
}
