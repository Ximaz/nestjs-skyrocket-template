import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/** Fastify over Express */
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

/** Winston Logger */
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';

/** Compression */
import { constants } from 'node:zlib';
import compression from '@fastify/compress';

const createLogger = () =>
  winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike('Nest', {
            colors: true,
            prettyPrint: true,
            processId: true,
            appName: true,
          }),
        ),
      }),
    ],
  });

const bootstrap = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: WinstonModule.createLogger({
        instance: createLogger(),
      }),
    },
  );

  // Fine-tuning is required here.
  await app.register(compression, {
    brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 1 } },
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
};

bootstrap().catch(console.error);
