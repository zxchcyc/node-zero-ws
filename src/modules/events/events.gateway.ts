import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'ws';
import { UseInterceptors, Logger } from '@nestjs/common';
import { RedisPropagatorInterceptor } from 'src/internal/redis-propagator/redis-propagator.interceptor';
import { RedisSocketEventEmitDTO } from 'src/internal/redis-propagator/dto/socket-event-emit.dto';

@UseInterceptors(RedisPropagatorInterceptor)
@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  onEvent(
    client: any,
    data: any,
  ): Observable<WsResponse<RedisSocketEventEmitDTO>> {
    // Logger.log(data);
    return from([data]).pipe(
      map((item) => ({
        event: 'events',
        data: item,
      })),
    );
  }
}
