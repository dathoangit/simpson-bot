import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';

import { ReferralModule } from '../referral/referral.module';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => ReferralModule),
    SharedModule,
  ],
  exports: [UserService],
  providers: [UserService],
})
export class UserModule {}
