/* eslint-disable max-len,@typescript-eslint/no-unnecessary-condition */

import { Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { Update } from 'nestjs-telegraf';
import { formatAmount } from 'src/common/utils';
import { type Context } from 'src/interfaces/telegram';
import { ReferralService } from 'src/modules/referral/referral.service';
import { UserService } from 'src/modules/user/user.service';
import { Markup } from 'telegraf';
import { Key, Keyboard } from 'telegram-keyboard';

import { TELEGRAM_ACTION } from '../../constants/telegram.actions';
import { TelegramState } from './telegram-state.service';

@Update()
export class TelegramActionService {
  private readonly logger = new Logger('TelegramActionService');

  constructor(
    // @InjectBot()
    // private readonly bot: Telegraf<Context>,
    private userService: UserService,
    private referralService: ReferralService,
    private telegramState: TelegramState,
  ) {}

  onStart = async (ctx: Context) => {
    const ref = (ctx as any).startPayload as string;
    await this.userService.getOrCreate({
      chatId: ctx.from?.id,
      username: ctx.from?.username
        ? `${ctx.from?.first_name}`
        : `${ctx.from?.first_name} ${ctx.from?.last_name}`,
    });

    if (ref) {
      await this.referralService.getOrCreate({
        referral: ctx.from?.id.toString() as string,
        chatId: ref,
        username: ctx.from?.username
          ? `${ctx.from?.first_name}`
          : `${ctx.from?.first_name} ${ctx.from?.last_name}`,
        ctx,
      });
    }

    this.onMissions(ctx).catch((error) => this.logger.error(error));
  };

  onProfile = async (ctx: Context) => {
    this.telegramState.update({
      chatId: ctx.from?.id as any,
      value: {
        action: TELEGRAM_ACTION.PROFILE,
      },
    });
    const startPayload = (ctx as any).startPayload as string;
    const ref = this.getRef(startPayload);

    const userInfo = await this.userService.getInfo(ctx.from?.id);
    const { balance, friends, u } = userInfo;

    await this.userService.getOrCreate({
      chatId: ctx.from?.id,
      username: ctx.from?.username
        ? `${ctx.from?.first_name}`
        : `${ctx.from?.first_name} ${ctx.from?.last_name}`,
    });

    if (ref) {
      await this.referralService.getOrCreate({
        referral: ctx.from?.id.toString() as string,
        chatId: ref,
        username: ctx.from?.username
          ? `${ctx.from?.first_name}`
          : `${ctx.from?.first_name} ${ctx.from?.last_name}`,
      });
    }

    const msg = `
Hi @${ctx.from?.username}
Email: \`${u?.email || 'Unknown'}\`
Wallet: \`${u?.wallet || 'Unknown'}\`

🪙 Total Token: ${formatAmount(balance, 18, 0, true)}
🪙 Total Invited: ${friends}
`;
    const keyboards = Keyboard.make([
      [
        Key.url("Let'go", 'https://jerryton.me'),
        Key.callback('Airdrop Missions', TELEGRAM_ACTION.MISSION),
      ],
      isAddress(u?.wallet || '')
        ? []
        : [Key.callback('Add Wallet', TELEGRAM_ACTION.ADD_INFO)],
    ]).inline();

    const { message_id: messageId } = await ctx.reply(msg, {
      reply_markup: keyboards.reply_markup,
      parse_mode: 'Markdown',
    });
    this.telegramState.update({
      chatId: ctx.from?.id as any,
      value: {
        messageId,
        action: TELEGRAM_ACTION.PROFILE,
      },
    });
  };

  async onInviteFriend(ctx: Context) {
    const [{ friends, balance }, referrer] = await Promise.all([
      this.userService.getInfo(ctx.from?.id),
      this.referralService.getReferrer(ctx.from?.id as any),
    ]);

    const msg = `
Your personal invite link
\`https://t.me/${ctx.botInfo.username}?start=rp_${ctx.from?.id}\`

Total Token: ${formatAmount(balance, 18, 0, true)}
Total Invited: ${friends ?? 0}
User Invited You: @${referrer?.user.username || ctx.botInfo.username}
`;

    return this.onMainMenu(ctx, msg);
  }

  async onRegister(ctx: Context) {
    const isJoinedChannel = await this.isJoinChannel(
      ctx.from?.id,
      ctx.telegram,
    );
    const isJoinedCommunity = await this.isJoinGroup(
      ctx.from?.id,
      ctx.telegram,
    );

    if (!isJoinedChannel || !isJoinedCommunity) {
      const msg = `🆘 You can't register before completing the Simpson [Telegram group](https://t.me/+hcb8QaRJIGVjMWVl) & [Telegram channel](https://t.me/testing_jerry_channel) tasks.`;
      await ctx.reply(msg, {
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true },
      });
    } else {
      await this.userService.updateUser(ctx.from?.id, {
        isJoinChannel: isJoinedChannel,
        isJoinCommunity: isJoinedCommunity,
      });

      const msg = 'Please enter your email address:';
      await this.returnMenu(ctx, msg).then(() => true);

      await ctx.scene
        .enter(TELEGRAM_ACTION.ADD_INFO)
        .catch((error) => this.logger.error(error))
        .then(() => true);
    }
  }

  async onMyBalance(ctx: Context) {
    const u = await this.userService.getInfo(ctx.from?.id as any);

    if (!u) {
      return;
    }

    let amount = '0';

    if (u.commission) {
      amount = ethers.utils.formatEther(u.commission);
    }

    const numberOfRef = u.u?.referrals ? u.u?.referrals.length : 0;
    const msg = `🏆 Reward: ${amount} Token

👨‍👩‍👧 Referral number: ${numberOfRef}

♾ https://t.me/SimpsonCryptoBot?start=${ctx.from?.id}`;

    await ctx.reply(msg, {
      // parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true },
    });
  }

  async onProject(ctx: Context) {
    const msg = `
How to Earn Tokens ⚡️

❇️ Community Activities:
Join the Community to earn 2,500 Token.

❇️ Channel Activities:
Join the Channel to earn 2,500 Token.

❇️ Friends:
Invite someone, and both you and your invitee will receive a bonus of 1,000 Token per invitation.

Join us and let's grow together!
    `;

    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true },
    });
  }

  async onJoinAirdrop(ctx: Context) {
    const msg = `💻 Please perform the *airdrop* tasks to earn up to 50,000 Token.

💠 Join Simpson [Telegram group](https://t.me/+hcb8QaRJIGVjMWVl) & [Telegram channel](https://t.me/testing_jerry_channel) (Required » 30,000 Token)

💠 Follow Simpson on [Twitter](https://twitter.com/) and retweet the pinned post by tagging 3 of your friends. (Required » 10,000 Token)

💠 Follow our promoter's [Twitter account](https://twitter.com/) and retweet the airdrop tweet. (Optional » 10,000 Token)`;

    const keyboards = Keyboard.make([
      [Key.callback(`Register`, TELEGRAM_ACTION.REGISTER)],
    ]).inline();

    await ctx.reply(msg, {
      reply_markup: keyboards.reply_markup,
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true },
    });
  }

  async onMissions(ctx: Context) {
    const msg = `🤝 Welcome ${ctx.from?.first_name} ${ctx.from?.last_name} I'll guide you on how to claim our airdrop.

1️⃣ First, click the Join Airdrop & Register button to perform the airdrop tasks and submit your information from the Register button.

2️⃣ You can check your balance and get your referral link by using the My Info button.

3️⃣ Please make sure that you have read the Information section.`;

    return this.onMainMenu(ctx, msg);
  }

  isJoinChannel = async (userId: number | undefined, telegram: any) => {
    console.log('innn')
    try {
      const res = await telegram
        .getChatMember(process.env.TELEGRAM_CHANEL_ID, userId)
        .catch((error: any) => {
          throw error;
        });
        console.log('isJoinChannel',res)

      return !(res.status === 'left');
    } catch {
      return false;
    }
  };

  isJoinGroup = async (userId: number | undefined, telegram: any) => {
    try {
      const res = await telegram
        .getChatMember(process.env.TELEGRAM_COMUNITY_ID, userId)
        .catch((error: any) => {
          throw error;
        });
        console.log('isJoinGroup',res)
      return !(res.status === 'left');
    } catch {
      return false;
    }
  };

  getRef = (startPayload: string) => {
    try {
      return startPayload.split('_')[1];
    } catch {
      return null;
    }
  };

  async returnMenu(ctx: Context, msg: string) {
    const replyKeyboard = Markup.keyboard([[{ text: 'Main Menu' }]]).resize();

    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: replyKeyboard.reply_markup,
    });
  }

  onMainMenu = async (
    ctx: Context,
    msg = '🖱 Click one of the buttons below',
  ) => {
    const replyKeyboard = Markup.keyboard([
      [{ text: 'Join Airdrop' }],
      [{ text: 'My Info' }, { text: 'Project' }],
    ]).resize();

    await ctx.reply(msg, {
      parse_mode: 'Markdown',
      reply_markup: replyKeyboard.reply_markup,
    });
  };

  async onDefault(ctx: Context) {
    const msg = '❓Unknown command';
    await ctx.reply(msg, {
      parse_mode: 'Markdown',
    });
  }
}
