import { Request } from 'express';

import { ValidateError } from '@exceptions/errors/index';
import { Controller, Get, Inject, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ErrorMessageCode } from './constants';
import { I18N_SERVICE } from './i18n/i18n.module';
import { I18nService } from './i18n/i18n.service';
import { LoggerService } from './logger/custom.logger';

@ApiTags('/')
@Controller()
export class AppController {
    constructor(private logger: LoggerService, @Inject(I18N_SERVICE) private i18n: I18nService) {}

    @Get()
    getHello() {
        return 'hello';
    }

    @Get('/profile')
    async profile(@Req() req: Request): Promise<any> {
        this.logger.verbose('verbose main');
        this.logger.debug('verbose 1', 'verbose 1');
        this.logger.log('log', 'verbose 1');
        this.logger.warn('warn');
        this.logger.error('error');
        return req.headers;
    }

    @Get('exceptions')
    TestException(): any {
        throw new ValidateError(ErrorMessageCode.INVALID, 400);
    }

    @Get('healthz')
    selfCheck(): unknown {
        return 'OK';
    }
}
