import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as io from 'socket.io-client';
import { initAdapters } from './adapters.init';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 初始化 WS 适配器
  initAdapters(app);
  await app.listen(process.env.PORT, () =>
    Logger.log(`Application is running on: localhost:${process.env.PORT}`),
  );

  process.on('unhandledRejection', (reason: Error, promise) => {
    if (!(reason instanceof Error)) {
      reason = new Error(reason);
    }
    const errorJson = {
      message: `unhandledRejection: ${reason.message}`,
      stack: reason.stack,
      promise: promise,
    };
    Logger.error(errorJson);
  });

  process.on('uncaughtException', (error: Error) => {
    const errorJson = {
      message: `uncaughtException: ${error.message}`,
      stack: error.stack,
    };
    Logger.error(errorJson);
  });
}
bootstrap();
