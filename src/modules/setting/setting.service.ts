import { Injectable } from '@nestjs/common';

import { BaseService } from '@base/base.service';
import { LoggerService } from '@src/logger/custom.logger';

import { SettingEntity } from '@entities/setting.entity';

import { SettingRepository } from './setting.repository';

@Injectable()
export class SettingService extends BaseService<SettingEntity, SettingRepository> {
    constructor(repository: SettingRepository, logger: LoggerService) {
        super(repository, logger);
    }
}
