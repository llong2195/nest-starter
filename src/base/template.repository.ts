import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@src/modules/user/entities/user.entity';

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
    constructor(private dataSource: DataSource) {
        super(UserEntity, dataSource.manager);
    }
}

/**
 * Template Custom Repository: TemplateRepository extends BaseRepository<Entity>
 *
 **/
@Injectable()
export class Template3Repository extends BaseRepository<UserEntity> {
    constructor(@InjectRepository(UserEntity) repository: Repository<UserEntity>) {
        super(repository);
    }
}
