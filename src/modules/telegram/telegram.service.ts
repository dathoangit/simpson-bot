/* eslint-disable no-fallthrough */
import { Logger } from '@nestjs/common';
import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'src/interfaces/telegram';
import { UserService } from 'src/modules/user/user.service';

import { TELEGRAM_ACTION } from '../../constants/telegram.actions';
import { TelegramActionService } from './telegram-action.service';
import { TelegramState } from './telegram-state.service';

@Update()
export class TelegramService {
  private readonly logger = new Logger('TelegramService');

  constructor(
    private telegramActionService: TelegramActionService,
    private userService: UserService,
    private telegramState: TelegramState,
  ) {}

  @Start()
  // @UseInterceptors(AuthTelegramUserInterceptor)
  start(@Ctx() ctx: Context) {
    if (this.ignoreGroup(ctx)) {
      return;
    }

    this.telegramActionService
      .onStart(ctx)
      .catch((error) => this.logger.error(error));
  }

  @On('text')
  onText(@Ctx() ctx: Context) {
    const message = ctx.message;

    if (message && 'text' in message) {
      const text = message.text;

      switch (text) {
        case 'Join Airdrop': {
          this.telegramActionService
            .onJoinAirdrop(ctx)
            .catch((error) => this.logger.error(error));
          break;
        }

        case 'My Info': {
          this.telegramActionService
            .onMyBalance(ctx)
            .catch((error) => this.logger.error(error));
          break;
        }

        case 'Project': {
          this.telegramActionService
            .onProject(ctx)
            .catch((error) => this.logger.error(error));
          break;
        }

        case 'Main Menu': {
          this.telegramActionService
            .onMainMenu(ctx)
            .catch((error) => this.logger.error(error));
          break;
        }

        default: {
          this.telegramActionService
            .onDefault(ctx)
            .catch((error) => this.logger.error(error));
          break;
        }
      }
    }
  }

  @On('callback_query')
  onCallBackQuery(@Ctx() ctx: Context) {
    if (this.ignoreGroup(ctx)) {
      return;
    }

    const action = (ctx.callbackQuery as any).data;

    switch (action) {
      case TELEGRAM_ACTION.JOIN_AIRDROP: {
        this.telegramActionService
          .onJoinAirdrop(ctx)
          .catch((error) => this.logger.error(error));
        break;
      }

      case TELEGRAM_ACTION.MISSION: {
        this.telegramActionService
          .onMissions(ctx)
          .catch((error) => this.logger.error(error));
        break;
      }

      case TELEGRAM_ACTION.INVITE_FRIEND: {
        this.telegramActionService
          .onInviteFriend(ctx)
          .catch((error) => this.logger.error(error));
        break;
      }

      case TELEGRAM_ACTION.ADD_INFO: {
        ctx.scene
          .enter(TELEGRAM_ACTION.ADD_INFO)
          .catch((error) => this.logger.error(error));
        break;
      }

      case TELEGRAM_ACTION.REGISTER: {
        ctx.answerCbQuery();
        this.telegramActionService
          .onRegister(ctx)
          .catch((error) => this.logger.error(error));
        break;
      }

      default: {
        break;
      }
    }
  }

  @On('new_chat_members')
  async onNewChatMember(@Ctx() ctx: Context) {
    // if (this.ignoreGroup(ctx)) return
    const id = ctx.message?.chat.id;
    const update: { isJoinCommunity?: boolean; isJoinChannel?: boolean } = {};

    if (Number(id) === Number(process.env.TELEGRAM_COMUNITY_ID)) {
      //left community
      update.isJoinCommunity = true;
    }

    if (Number(id) === Number(process.env.TELEGRAM_CHANEL_ID)) {
      //left community
      update.isJoinChannel = true;
    }

    await this.userService.updateUser(ctx.message?.from.id, update);
    const state = this.telegramState.get(ctx.message?.from.id);

    if (state.action === TELEGRAM_ACTION.MISSION) {
      this.telegramActionService
        .onMissions(ctx)
        .catch((error) => this.logger.error(error));
    }
  }

  @On('left_chat_member')
  async onLeftChatMember(@Ctx() ctx: Context) {
    // if (this.ignoreGroup(ctx)) return
    const id = ctx.message?.chat.id;
    const update: { isJoinCommunity?: boolean; isJoinChannel?: boolean } = {};

    if (Number(id) === Number(process.env.TELEGRAM_COMUNITY_ID)) {
      //left community
      update.isJoinCommunity = false;
    }

    if (Number(id) === Number(process.env.TELEGRAM_CHANEL_ID)) {
      //left community
      update.isJoinChannel = false;
    }

    await this.userService.updateUser(ctx.message?.from.id, update);
    const state = this.telegramState.get(ctx.message?.from.id);

    if (state.action === TELEGRAM_ACTION.MISSION) {
      this.telegramActionService
        .onMissions(ctx)
        .catch((error) => this.logger.error(error));
    }
  }

  ignoreGroup(ctx: Context) {
    if (
      Number(ctx.message?.chat.id) ===
        Number(process.env.TELEGRAM_COMUNITY_ID) ||
      Number(ctx.message?.chat.id) === Number(process.env.TELEGRAM_CHANEL_ID)
    ) {
      return true;
    }

    return false;
  }
}
