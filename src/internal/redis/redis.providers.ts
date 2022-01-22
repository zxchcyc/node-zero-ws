import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { EnvService } from '../env/env.service';

import {
  REDIS_PUBLISHER_CLIENT,
  REDIS_SUBSCRIBER_CLIENT,
  REDIS_CLIENT,
} from './redis.constants';

export type RedisClient = Redis.Redis;

export const redisProviders: Provider[] = [
  {
    useFactory: async (envService: EnvService): Promise<RedisClient> => {
      return new Redis({
        name: envService.get('REDIS_NAME'),
        host: envService.get('REDIS_HOST'),
        port: Number(envService.get('REDIS_PORT')),
        db: Number(envService.get('REDIS_DATABASE')),
        password: envService.get('REDIS_PASSWORD'),
        keyPrefix: envService.get('REDIS_KEYPREFIX'),
      });
    },
    inject: [EnvService],
    provide: REDIS_SUBSCRIBER_CLIENT,
  },
  {
    useFactory: async (envService: EnvService): Promise<RedisClient> => {
      return new Redis({
        name: envService.get('REDIS_NAME'),
        host: envService.get('REDIS_HOST'),
        port: Number(envService.get('REDIS_PORT')),
        db: Number(envService.get('REDIS_DATABASE')),
        password: envService.get('REDIS_PASSWORD'),
        keyPrefix: envService.get('REDIS_KEYPREFIX'),
      });
    },
    inject: [EnvService],
    provide: REDIS_PUBLISHER_CLIENT,
  },
  {
    useFactory: async (envService: EnvService): Promise<RedisClient> => {
      return new Redis({
        name: envService.get('REDIS_NAME'),
        host: envService.get('REDIS_HOST'),
        port: Number(envService.get('REDIS_PORT')),
        db: Number(envService.get('REDIS_DATABASE')),
        password: envService.get('REDIS_PASSWORD'),
        keyPrefix: envService.get('REDIS_KEYPREFIX'),
      });
    },
    inject: [EnvService],
    provide: REDIS_CLIENT,
  },
];
