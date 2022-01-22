import { INestApplication } from '@nestjs/common';
import { SocketStateService } from './internal/socket-state/socket-state.service';
import { SocketStateAdapter } from './internal/socket-state/socket-state.adapter';
import { RedisPropagatorService } from './internal/redis-propagator/redis-propagator.service';
import { RedisService } from './internal/redis/redis.service';
import { EnvService } from './internal/env/env.service';

export const initAdapters = (app: INestApplication): INestApplication => {
  const socketStateService = app.get(SocketStateService);
  const redisPropagatorService = app.get(RedisPropagatorService);
  const redisService = app.get(RedisService);
  const envService = app.get(EnvService);
  app.useWebSocketAdapter(
    new SocketStateAdapter(
      app,
      socketStateService,
      redisPropagatorService,
      redisService,
      envService,
    ),
  );
  return app;
};
