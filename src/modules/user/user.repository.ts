import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { UserEntity } from '@entities/user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
    constructor(
        private readonly dataSource: DataSource,
        manager?: EntityManager,
    ) {
        let sManager: EntityManager;
        let sQueryRunner: QueryRunner;
        if (manager && manager != undefined && manager != null) {
            sQueryRunner = manager.queryRunner;
            sManager = manager;
        } else {
            sManager = dataSource?.createEntityManager();
            sQueryRunner = dataSource?.createQueryRunner();
        }
        super(UserEntity, sManager, sQueryRunner);
    }
}
