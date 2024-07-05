/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BigNumber } from 'ethers';
import { AirdropAmount } from 'src/constants/airdrop';
import { type Context } from 'src/interfaces/telegram';
import { UserEntity } from 'src/modules/user/user.entity';
import { Repository } from 'typeorm';

import { ReferralEntity } from './referral.entity';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(ReferralEntity)
    private referralEntity: Repository<ReferralEntity>,

    @InjectRepository(UserEntity)
    private userEntity: Repository<UserEntity>,
  ) {}

  async getOrCreate(args: {
    referral: string;
    username: string;
    chatId: any;
    ctx?: Context;
  }) {
    if (Number(args.referral) === Number(args.chatId)) {
      return;
    }

    const u = await this.userEntity.findOne({
      where: {
        chatId: args.chatId,
      },
    });

    if (!u) {
      return;
    }

    let r = await this.referralEntity.findOne({
      where: {
        user: {
          chatId: args.chatId,
        },
        referral: args.referral,
      },
    });

    if (r) {
      return;
    }

    r = this.referralEntity.create({
      referral: args.referral,
      user: u,
    });
    await this.referralEntity.save(r);

    // await this.updateTotalAirdrop();
    await this.updateCommission(u.chatId);
    await this.updateCommission(args.referral);
    args.ctx &&
      (await args.ctx.telegram.sendMessage(
        u.chatId as any,
        `
🥳Congratulations!

🧑‍🤝‍🧑You have successfully invited 【${args.username}】!
🎁 1,000 Token
    `,
      ));

    return r;
  }

  async findOne(referral: string) {
    return this.referralEntity.findOne({
      where: {
        referral,
      },
    });
  }

  async getReferrer(referral: string): Promise<ReferralEntity | null> {
    return await this.referralEntity.findOne({
      where: {
        referral,
      },
      relations: {
        user: true,
      },
    });
  }


  async updateCommission(chatId: any, amount = AirdropAmount.INVITE) {
    const u = await this.userEntity.findOne({
      where: {
        chatId,
      },
    });

    if (!u) {
      return;
    }

    await this.userEntity.update(
      {
        chatId,
      },
      {
        commission: BigNumber.from(u.commission ?? '0')
          .add(amount)
          .toString(),
      },
    );
  }
}
