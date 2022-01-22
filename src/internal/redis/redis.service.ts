import { Inject, Injectable } from '@nestjs/common';
import { Observable, Observer } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  REDIS_PUBLISHER_CLIENT,
  REDIS_SUBSCRIBER_CLIENT,
  REDIS_CLIENT,
} from './redis.constants';
import { RedisClient } from './redis.providers';
import { RedisSocketEventSendDTO } from '../redis-propagator/dto/socket-event-send.dto';

export interface RedisSubscribeMessage {
  readonly message: string;
  readonly channel: string;
}

@Injectable()
export class RedisService {
  public constructor(
    @Inject(REDIS_SUBSCRIBER_CLIENT)
    private readonly redisSubscriberClient: RedisClient,
    @Inject(REDIS_PUBLISHER_CLIENT)
    private readonly redisPublisherClient: RedisClient,
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClient,
  ) {}

  public fromEvent<T extends RedisSocketEventSendDTO>(
    eventName: string,
  ): Observable<T> {
    this.redisSubscriberClient.subscribe(eventName);

    // 创建 observables 用于订阅 redis 事件
    return Observable.create((observer: Observer<RedisSubscribeMessage>) =>
      this.redisSubscriberClient.on('message', (channel, message) =>
        observer.next({ channel, message }),
      ),
    ).pipe(
      filter(({ channel }) => channel === eventName),
      map(({ message }) => JSON.parse(message)),
    );
  }

  public async publish(channel: string, value: unknown): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      // 用于 redis 事件发布
      return this.redisPublisherClient.publish(
        channel,
        JSON.stringify(value),
        (error, reply) => {
          if (error) {
            return reject(error);
          }
          return resolve(reply);
        },
      );
    });
  }

  public async get(key: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      return this.redisClient.get(key, (error, reply) => {
        if (error) {
          return reject(error);
        }
        return resolve(reply);
      });
    });
  }
}
