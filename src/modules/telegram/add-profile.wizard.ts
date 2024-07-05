import { Logger } from '@nestjs/common';
import { isAddress } from 'ethers/lib/utils';
import { Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { TELEGRAM_ACTION } from 'src/constants/telegram.actions';
import { isEmail } from 'src/util/common';
import { WizardContext } from 'telegraf/typings/scenes';

import { UserService } from '../user/user.service';
import { TelegramActionService } from './telegram-action.service';

@Wizard(TELEGRAM_ACTION.ADD_INFO)
export class AddInfoWizard {
  private readonly logger = new Logger('TelegramService');

  constructor(
    private userService: UserService,
    private telegramActionService: TelegramActionService,
  ) {}

  @WizardStep(1)
  onSceneEmail(@Ctx() ctx: WizardContext) {
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(2)
  async onEnterTraderEmail(
    @Ctx()
    ctx: WizardContext & {
      wizard: { state: { step1MsgId: number; email: string } };
    },
    @Message() msg: { text: string },
  ) {
    if (msg.text === 'Main Menu') {
      await ctx.scene
        .leave()
        .catch((error) => this.logger.error(error))
        .then(() => true);
      await this.telegramActionService.onMainMenu(ctx).then(() => true);

      return;
    }

    if (!isEmail(msg.text)) {
      await ctx.reply(
        '❌ You must use a valid Email address. Please try again.',
      );

      return;
    }
    ctx.wizard.state.email = msg.text.toLowerCase();

    await ctx.reply('The wallet address you used to receive the airdrop: ');
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(3)
  async onEnterTraderAddress(
    @Ctx()
    ctx: WizardContext & {
      wizard: { state: { step3MsgId: number; email: string } };
    },
    @Message() msg: { text: string },
  ) {
    if (!isAddress(msg.text)) {
      await ctx.reply(
        '❌ You must use a valid Address address. Please try again.',
      );

      return;
    }
    const email = ctx.wizard.state.email;

    await this.userService.updateUser(ctx.from?.id, {
      wallet: msg.text.toLowerCase(),
      email: email,
    });
    await this.telegramActionService.onProfile(ctx);
    await ctx.scene.leave();
  }
}
