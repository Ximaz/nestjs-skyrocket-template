import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/** Fastify over Express */
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

/** Winston Logger */
import LoggerService from './logger/logger.service';
import { Logger, ValidationPipe } from '@nestjs/common';

/** Compression */
import { constants } from 'node:zlib';
import compression from '@fastify/compress';

/** OpenAPI */
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

const getSwaggerDocumentConfig = (): Omit<OpenAPIObject, 'paths'> =>
  new DocumentBuilder()
    .setTitle('OpenAPI Documentation')
    .setDescription(
      'This document indexes all the available routes, along with their params, queries, payloads and responses.',
    )
    .setVersion('1.0')
    // .addBearerAuth({
    //     type: "http",
    //     description:
    //         "An encrypted JWT returned by the 'register' or 'login' endpoint.",
    //     name: "bearer"
    // })
    .build();

const bootstrap = async () => {
  /** Create the application and override the default logger */
  const loggerService = new LoggerService();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: loggerService,
    },
  );

  Logger.overrideLogger(loggerService);

  /** Setup the ValidationPipe to transform DTOs types correctly */
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  /** Setup the Accept-Control-Allow-Origin for CORS security */
  const configService = app.get(ConfigService);
  const trustedOrigin = configService.getOrThrow<string>('ORIGIN');
  app.enableCors({
    origin: trustedOrigin,
    credentials: true,
  });

  /** Setup the Swagger OpenAPI documentation */
  const swaggerDocumentationConfig = getSwaggerDocumentConfig();
  const document = SwaggerModule.createDocument(
    app,
    swaggerDocumentationConfig,
  );
  const theme = new SwaggerTheme();
  const swaggerConfig: SwaggerCustomOptions = {
    explorer: true,
    customSiteTitle: swaggerDocumentationConfig.info.title,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
  };
  SwaggerModule.setup('/openapi', app, document, swaggerConfig);

  /** Setup the response compression middleware */
  await app.register(compression, {
    brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 1 } },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
};

bootstrap().catch(console.error);
