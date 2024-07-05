import { type EntitySubscriberInterface, EventSubscriber } from 'typeorm';

import { UserEntity } from '../modules/user/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  listenTo(): typeof UserEntity {
    return UserEntity;
  }
}
