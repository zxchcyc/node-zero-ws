import { Global, Module } from '@nestjs/common';
import { RedisPropagatorModule } from './redis-propagator/redis-propagator.module';
import { RedisModule } from './redis/redis.module';
import { SocketStateModule } from './socket-state/socket-state.module';
import { UtilModule } from './util/util.module';
import { EnvModule } from './env/env.module';

@Global()
@Module({
  imports: [
    EnvModule.register({ folder: process.env.CONFIG_FOLDER }),
    UtilModule,
    RedisModule,
    RedisPropagatorModule,
    SocketStateModule,
  ],
  exports: [
    EnvModule.register({ folder: process.env.CONFIG_FOLDER }),
    UtilModule,
    RedisModule,
    RedisPropagatorModule,
    SocketStateModule,
  ],
})
export class InternalModule {}
