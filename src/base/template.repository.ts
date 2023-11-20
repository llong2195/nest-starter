import { DataSource, EntityManager, Repository } from 'typeorm';

import { UserEntity } from '@entities/index';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { BaseRepository } from './base.repository';

/**
 * Template Custom Repository: TemplateRepository extends Repository<Entity>
 *
 **/
@Injectable()
export class TemplateRepository extends Repository<UserEntity> {
    constructor(@InjectRepository(UserEntity) userRepo: Repository<UserEntity>) {
        super(userRepo.target, userRepo.manager, userRepo.queryRunner);
    }
}

/**
 * Template Custom Repository: TemplateRepository extends Repository<Entity>
 *
 **/
@Injectable()
export class Template2Repository extends Repository<UserEntity> {
    constructor(
        private readonly dataSource: DataSource,
        manager?: EntityManager,
    ) {
        let sManager;
        let sQueryRunner;
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
/**
 * Template Custom Repository: TemplateRepository extends Repository<Entity>
 *
 **/
@Injectable()
export class Template3Repository extends Repository<UserEntity> {
    constructor(private dataSource: DataSource) {
        super(UserEntity, dataSource.manager);
    }
}

/**
 * Template Custom Repository: TemplateRepository extends BaseRepository<Entity>
 *
 **/
@Injectable()
export class Template4Repository extends BaseRepository<UserEntity> {
    constructor(@InjectRepository(UserEntity) repository: Repository<UserEntity>) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}
