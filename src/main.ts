import { useContainer } from 'class-validator';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import {
  ForbiddenException,
  INestApplication,
  LogLevel,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { EnvEnum } from './common/enums';
import { LoggerService } from './common/logger/custom.logger';
import { I18nService } from './common/shared/i18n.service';
import { ValidatorsModule } from './common/validators/validators.module';
import { ValidationConfig } from './configs';
import { isEnv, isProd } from './utils';

async function bootstrap() {
  let logLevelsDefault: LogLevel[] = [
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
  ];

  if (isEnv(EnvEnum.Production) || isEnv(EnvEnum.Staging)) {
    const logLevel = process.env.LOG_LEVEL || 'error,debug,verbose';
    logLevelsDefault = logLevel.split(',') as LogLevel[];
  }

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      logger: logLevelsDefault,
    },
  );

  // ------------- Config ---------------
  const configService = app.get(ConfigService);
  const port: number = configService.get<number>('PORT') || 4000;
  const LISTEN_ON: string = configService.get<string>('LISTEN_ON') || '0.0.0.0';
  const DOMAIN_WHITELIST: string[] = (
    configService.get<string>('DOMAIN_WHITELIST') || '*'
  ).split(',');
  const API_PREFIX = configService.get<string>('API_PREFIX') || 'api';
  // -------------------------------------------

  // -------------- Middleware --------------
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  // -------------------------------------------

  // -------------- Global filter/pipes --------------
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new ValidationPipe(ValidationConfig));
  app.enableVersioning({ type: VersioningType.URI });
  // -------------------------------------------

  // -------------- Setup Cors --------------
  if (isProd()) {
    app.use(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      helmet({
        crossOriginResourcePolicy: false,
      }),
    );
    app.enableCors({
      origin: (origin, callback) => {
        if (
          DOMAIN_WHITELIST.indexOf('*') !== -1 ||
          (origin && DOMAIN_WHITELIST.indexOf(origin) !== -1)
        ) {
          callback(null, true);
        } else {
          callback(
            new ForbiddenException(
              `The CORS policy for this site does not allow access from the specified Origin.`,
            ),
            false,
          );
        }
      },
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });
    // await app.register(helmet);
  } else {
    app.enableCors({
      origin: '*',
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });
    // -----------Setup Swagger-------------
    ConfigDocument(app, `${API_PREFIX}/docs`);
    // -------------------------------------------
  }

  // -------------------------------------------

  // -----------------Validator-----------------
  useContainer(app.select(ValidatorsModule), { fallbackOnErrors: true });
  // -------------------------------------------

  // -----------I18nService init-------------
  I18nService.init();
  // -------------------------------------------

  // -----------Setup Redis Adapter-------------
  // await initAdapters(app);
  // -------------------------------------------

  await app.listen(port, LISTEN_ON, () => {
    LoggerService.log(
      `==========================================================`,
    );
    LoggerService.log(`Server is running on port : ${port}`, 'Server');
    LoggerService.log(
      `Application is running on : http://127.0.0.1:${port}`,
      'Application',
    );
    if (!isProd()) {
      LoggerService.log(`Swagger: http://127.0.0.1:${port}/${API_PREFIX}/docs`);
    }
    LoggerService.log(
      `==========================================================`,
    );
  });
}

function ConfigDocument(app: INestApplication, path: string) {
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addTag('Document For API')
    .addBearerAuth({
      type: 'http',
      in: 'header',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(path, app, document);
  LoggerService.log(
    `==========================================================`,
  );
  LoggerService.log(`Swagger Init: /${path}`, ConfigDocument.name);
  LoggerService.log(
    `==========================================================`,
  );
}

void bootstrap();

// runInCluster(bootstrap);
