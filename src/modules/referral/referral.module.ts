import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserModule } from 'src/modules/user/user.module';
import { SharedModule } from 'src/shared/shared.module';

import { ReferralEntity } from './referral.entity';
import { ReferralService } from './referral.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    SharedModule,
    TypeOrmModule.forFeature([UserEntity, ReferralEntity]),
  ],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
