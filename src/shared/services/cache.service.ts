/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(
    @InjectRedis() private readonly redis: Redis, // or // @InjectRedis(DEFAULT_REDIS_NAMESPACE) private readonly redis: Redis
  ) {}

  async set(key: string, value: any, ttl?: number) {
    if (ttl) {
      return this.redis.set(key, value, 'EX', ttl);
    }

    return this.redis.set(key, value);
  }

  async get(key: string, defaultVal?: any): Promise<any | null> {
    try {
      return await this.redis.get(key);
    } catch {
      return defaultVal;
    }
  }
}
