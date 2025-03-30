import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/** Fastify over Express */
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

/** Winston Logger */
import LoggerService from './logger/logger.service';

/** Compression */
import { constants } from 'node:zlib';
import compression from '@fastify/compress';
import { Logger } from '@nestjs/common';

const bootstrap = async () => {
  const loggerService = new LoggerService();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: loggerService,
    },
  );

  Logger.overrideLogger(loggerService);

  // Fine-tuning is required here.
  await app.register(compression, {
    brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 1 } },
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
};

bootstrap().catch(console.error);
