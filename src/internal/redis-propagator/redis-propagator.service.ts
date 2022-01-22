import { Injectable, Logger } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { Server } from 'socket.io';

import { RedisSocketEventEmitDTO } from './dto/socket-event-emit.dto';
import { RedisSocketEventSendDTO } from './dto/socket-event-send.dto';
import {
  REDIS_SOCKET_EVENT_EMIT_ALL_NAME,
  REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME,
  REDIS_SOCKET_EVENT_SEND_NAME,
} from './redis-propagator.constants';
import { SocketStateService } from '../socket-state/socket-state.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisPropagatorService {
  private socketServer: Server;

  public constructor(
    private readonly socketStateService: SocketStateService,
    private readonly redisService: RedisService,
  ) {
    // 订阅 rxjs 事件并绑定 redis 订阅事件处理函数
    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_SEND_NAME)
      .pipe(tap(this.consumeSendEvent))
      .subscribe();

    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_EMIT_ALL_NAME)
      .pipe(tap(this.consumeEmitToAllEvent))
      .subscribe();

    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME)
      .pipe(tap(this.consumeEmitToAuthenticatedEvent))
      .subscribe();
  }

  // 注入 WS
  public injectSocketServer(server: Server): RedisPropagatorService {
    this.socketServer = server;
    return this;
  }

  // 发送给指定用户
  private consumeSendEvent = (eventInfo: RedisSocketEventSendDTO): void => {
    const { userId, socketId, sendTo, event, data } = eventInfo;
    Logger.debug(eventInfo, 'consumeSendEvent');
    // 获取要发送的人信息
    // filter 过滤掉自身
    return this.socketStateService
      .get(sendTo)
      .filter((socket) => {
        return socket.id !== socketId;
      })
      .forEach((socket) => {
        socket.emit(
          event,
          { ...data, sendTo: sendTo, from: userId },
          (data: any) => {
            // 如果需要客户端确定收到 在这里处理
            // Logger.log(data, 'ack');
          },
        );
      });
  };

  // 全局广播
  private consumeEmitToAllEvent = (
    eventInfo: RedisSocketEventEmitDTO,
  ): void => {
    Logger.debug('consumeEmitToAllEvent');
    this.socketServer.emit(eventInfo.event, eventInfo.data);
  };

  // 发送给已登录用户
  private consumeEmitToAuthenticatedEvent = (
    eventInfo: RedisSocketEventSendDTO,
  ): void => {
    const { userId, socketId, sendTo, event, data } = eventInfo;
    Logger.debug('consumeEmitToAuthenticatedEvent');
    // 获取要发送的人信息
    // filter 过滤掉自身
    return this.socketStateService
      .getAll()
      .filter((socket) => {
        return socket.id !== socketId;
      })
      .forEach((socket) => {
        socket.emit(
          event,
          { ...data, sendTo: sendTo, from: userId },
          (data: any) => {
            // 如果需要客户端确定收到 在这里处理
            // Logger.log(data, 'ack');
          },
        );
      });
  };

  // 向 redis 发布事件
  public propagateEvent(eventInfo: RedisSocketEventSendDTO): boolean {
    if (!eventInfo.userId) {
      return false;
    }
    Logger.debug('propagateEvent');
    this.redisService.publish(REDIS_SOCKET_EVENT_SEND_NAME, eventInfo);
    return true;
  }

  public emitToAll(eventInfo: RedisSocketEventSendDTO): boolean {
    Logger.debug('emitToAll');
    this.redisService.publish(REDIS_SOCKET_EVENT_EMIT_ALL_NAME, eventInfo);
    return true;
  }

  public emitToAuthenticated(eventInfo: RedisSocketEventSendDTO): boolean {
    Logger.debug('emitToAuthenticated');
    this.redisService.publish(
      REDIS_SOCKET_EVENT_EMIT_AUTHENTICATED_NAME,
      eventInfo,
    );
    return true;
  }
}
