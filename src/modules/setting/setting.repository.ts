import { DataSource, EntityManager, Repository } from 'typeorm';

import { Injectable, Optional } from '@nestjs/common';

import { SettingEntity } from '@entities/setting.entity';

@Injectable()
export class SettingRepository extends Repository<SettingEntity> {
    constructor(private readonly dataSource: DataSource, @Optional() manager?: EntityManager) {
        let sManager;
        let sQueryRunner;
        if (manager && manager != undefined && manager != null) {
            sQueryRunner = manager.queryRunner;
            sManager = manager;
        } else {
            sManager = dataSource?.createEntityManager();
            sQueryRunner = dataSource?.createQueryRunner();
        }
        super(SettingEntity, sManager, sQueryRunner);
    }
}
