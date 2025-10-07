import { constants } from 'node:zlib';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { LoggerService } from './logger/logger.service.js';
import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

const getSwaggerDocumentConfig = (): Omit<OpenAPIObject, 'paths'> =>
  new DocumentBuilder()
    .setTitle('OpenAPI Documentation')
    .setDescription(
      'This document indexes all the available routes, along with their params, queries, payloads and responses.',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      description:
        "An encrypted JWT returned by the 'auth/register' or 'auth/login' endpoint.",
      name: 'bearer',
    })
    .addTag('OAuth2.0', 'All the endpoints related to authentication process.')
    .build();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const loggerService = app.get(LoggerService);
  app.useLogger(loggerService);
  Logger.overrideLogger(loggerService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.register(import('@fastify/compress'), {
    brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 1 } },
  });

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

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap().catch(console.error);
