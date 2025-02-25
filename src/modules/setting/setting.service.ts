import { Repository } from 'typeorm';

import { BaseService } from '@/common/base/base.service';
import { LoggerService } from '@/common/logger/custom.logger';
import { SettingEntity } from '@/database/pg/entities/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SettingService extends BaseService<
  SettingEntity,
  Repository<SettingEntity>
> {
  constructor(
    @InjectRepository(SettingEntity) repository: Repository<SettingEntity>,
    logger: LoggerService,
  ) {
    super(repository, logger);
  }
}
