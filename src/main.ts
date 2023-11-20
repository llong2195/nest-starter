import { ForbiddenException, INestApplication, LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { ValidationConfig } from '@configs/validation.config';
import { LoggerService } from '@src/logger/custom.logger';
import { ValidatorsModule } from '@validators/validators.module';
import { AppModule } from './app.module';
import { EnvEnum } from './enums/app.enum';
import { I18nService } from './i18n/i18n.service';
import { isEnv } from './utils/util';

// import bodyParser from 'body-parser';
declare const module: any;

async function bootstrap() {
    let logLevelsDefault: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

    if (isEnv(EnvEnum.Production) || isEnv(EnvEnum.Staging)) {
        const logLevel = process.env.LOG_LEVEL || 'log,error,warn,debug,verbose';
        logLevelsDefault = logLevel.split(',') as LogLevel[];
    }
    const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
        logger: logLevelsDefault,
        snapshot: true,
    });
    // ------------- Config ---------------
    const configService = app.get(ConfigService);
    const port: number = configService.get<number>('PORT');
    const LISTEN_ON: string = configService.get<string>('LISTEN_ON') || '0.0.0.0';
    const DOMAIN_WHITELIST: string[] = (configService.get<string>('DOMAIN_WHITELIST') || '*').split(',');
    // -------------------------------------------

    // -------------- Middleware --------------
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
    // app.use('/payment/hooks', bodyParser.raw({ type: 'application/json' })); // webhook use rawBody
    // -------------------------------------------

    // -------------- Global filter/pipes --------------
    app.useGlobalPipes(new ValidationPipe(ValidationConfig));
    app.setGlobalPrefix(configService.get<string>('API_PREFIX'));
    // -------------------------------------------

    // -------------- Setup Cors --------------
    if (isEnv(EnvEnum.Dev)) {
        app.enableCors({
            origin: '*',
            optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        });
        // -----------Setup Swagger-------------
        await ConfigDocument(app);
        // -------------------------------------------
    } else {
        app.use(
            helmet({
                crossOriginResourcePolicy: false,
            }),
        );
        app.enableCors({
            origin: (origin, callback) => {
                if (DOMAIN_WHITELIST.indexOf('*') !== -1 || DOMAIN_WHITELIST.indexOf(origin) !== -1) {
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

    await app.listen(port, LISTEN_ON, async () => {
        LoggerService.log(`==========================================================`);
        LoggerService.log(`Server is running on port : ${port}`, 'Server');
        LoggerService.log(`Application is running on : ${await app.getUrl()}`, 'Application');
        LoggerService.log(`==========================================================`);
    });

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}

async function ConfigDocument(app: INestApplication): Promise<void> {
    const config = new DocumentBuilder()
        .setTitle('API')
        .setDescription('API docs')
        .setVersion('1.0')
        .addTag('Document For API')
        .addBearerAuth({ type: 'http', in: 'header', scheme: 'bearer', bearerFormat: 'JWT' })
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    LoggerService.log(`==========================================================`);
    LoggerService.log(`Swagger Init: /docs`, ConfigDocument.name);
    LoggerService.log(`==========================================================`);
}

bootstrap();

// runInCluster(bootstrap);
