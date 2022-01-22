import {
  Logger,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WsResponse } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { RedisPropagatorService } from './redis-propagator.service';
import { AuthenticatedSocket } from '../socket-state/socket-state.adapter';

@Injectable()
export class RedisPropagatorInterceptor<T>
  implements NestInterceptor<T, WsResponse<T>> {
  public constructor(
    private readonly redisPropagatorService: RedisPropagatorService,
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<WsResponse<T>> {
    const socket: AuthenticatedSocket = context.switchToWs().getClient();

    return next.handle().pipe(
      tap((data) => {
        // Logger.debug(data);
        if (!data.data.sendTo) {
          // 默认全局广播
          data.data.sendTo === ['All'];
        }
        if (!Array.isArray(data.data.sendTo)) {
          data.data.sendTo = [data.data.sendTo];
        }
        for (const sendTo of data.data.sendTo) {
          if (sendTo === 'All') {
            // 集群全局广播
            this.redisPropagatorService.emitToAll({
              ...data,
              sendTo: sendTo,
              socketId: socket.id,
              userId: socket.auth?.userId,
            });
          } else if (sendTo === 'Authenticated') {
            // 集群发送给已登录用户
            this.redisPropagatorService.emitToAuthenticated({
              ...data,
              sendTo: sendTo,
              socketId: socket.id,
              userId: socket.auth?.userId,
            });
          } else {
            // 集群发送给指定用户
            this.redisPropagatorService.propagateEvent({
              ...data,
              sendTo: sendTo,
              socketId: socket.id,
              userId: socket.auth?.userId,
            });
          }
        }
      }),
    );
  }
}
