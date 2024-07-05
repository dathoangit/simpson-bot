import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralModule } from 'src/modules/referral/referral.module';
import { UserModule } from 'src/modules/user/user.module';

import { AddInfoWizard } from './add-profile.wizard';
import { TelegramService } from './telegram.service';
import { TelegramActionService } from './telegram-action.service';
import { TelegramState } from './telegram-state.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    forwardRef(() => UserModule),
    forwardRef(() => ReferralModule),
  ],

  providers: [
    TelegramState,
    TelegramService,
    TelegramActionService,
    AddInfoWizard,
  ],
})
export class TelegramModule {}
