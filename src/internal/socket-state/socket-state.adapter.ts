/*
 * @Author: archer zheng
 * @Date: 2020-08-28 16:01:37
 * @LastEditTime: 2022-01-22 09:24:06
 * @LastEditors: archer zheng
 * @Description: 自定义 WS 适配器 主要目的是进行 安全验证和维护 socket 和用户关系
 */
import {
  INestApplicationContext,
  WebSocketAdapter,
  Logger,
} from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import socketio from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { SocketStateService } from './socket-state.service';
import { RedisPropagatorService } from '../redis-propagator/redis-propagator.service';
import { RedisService } from '../redis/redis.service';
import { EnvService } from '../env/env.service';

interface TokenPayload {
  readonly userId: string;
}

export interface AuthenticatedSocket extends socketio.Socket {
  auth: TokenPayload;
}

export class SocketStateAdapter extends IoAdapter implements WebSocketAdapter {
  public constructor(
    private readonly app: INestApplicationContext,
    private readonly socketStateService: SocketStateService,
    private readonly redisPropagatorService: RedisPropagatorService,
    private readonly redisService: RedisService,
    private readonly envService: EnvService,
  ) {
    super(app);
  }

  public create(
    port: number,
    options: socketio.ServerOptions,
  ): socketio.Server {
    const server = super.createIOServer(port, options);
    this.redisPropagatorService.injectSocketServer(server);

    server.use(async (socket: AuthenticatedSocket, next) => {
      const token =
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization;

      if (!token) {
        // 实际上这里不要放行
        socket.auth = null;
        Logger.debug('unauthorized');
        return next(new Error('unauthorized'));
      }

      try {
        if (token === this.envService.get('WS_API_KEY')) {
          // 是否 API 客户端
          Logger.log('API ...');
          socket.auth = {
            userId: 'API',
          };
          return next();
        } else {
          // 根据 token 拿到 userId
          let userInfo: any = jwt.verify(token, this.envService.get('JWT_SECRET'))
          Logger.log(userInfo);
          if (!userInfo?.id) {
            Logger.debug('unauthorized');
            return next(new Error('unauthorized'));
          }
          socket.auth = {
            // 支持多站点
            userId:`${userInfo?.website}_${userInfo.id}` ,
          };
          return next();
        }
      } catch (error) {
        return next(error);
      }
    });

    return server;
  }

  public bindClientConnect(server: socketio.Server, callback: Function): void {
    server.on('connection', (socket: AuthenticatedSocket) => {
      Logger.debug('bindClientConnect connection');
      if (socket.auth) {
        this.socketStateService.add(socket.auth.userId, socket);

        socket.on('disconnect', () => {
          Logger.debug('bindClientConnect disconnect');
          this.socketStateService.remove(socket.auth.userId, socket);

          socket.removeAllListeners('disconnect');
        });
      } else {
        socket.removeAllListeners('disconnect');
      }

      callback(socket);
    });
  }
}
