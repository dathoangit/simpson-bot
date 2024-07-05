import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramState {
  state = new Map<number, Record<string, any>>();

  constructor() {}

  set(args: { chatId: number; value: Record<string, any> }) {
    this.state.set(Number(args.chatId), args.value);

    return args.value;
  }

  update(args: { chatId: number; value: Record<string, any> }) {
    const val = this.get(Number(args.chatId));
    this.set({
      chatId: Number(args.chatId),
      value: { ...val, ...args.value },
    });
  }

  get(chatId) {
    return this.state.get(Number(chatId)) || {};
  }

  reset(chatId: number) {
    this.state.delete(chatId);
  }
}
