import { DataSource, EntityManager, Repository } from 'typeorm';

import { Injectable, Optional } from '@nestjs/common';

import { FileEntity } from '@entities/file.entity';

@Injectable()
export class FileRepository extends Repository<FileEntity> {
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
        super(FileEntity, sManager, sQueryRunner);
    }

    /**
     * Add a basic where clause to the query and return the first result.
     */

    /**
     * It returns a promise that resolves to an array of all the documents in the collection
     * @returns The find() method returns a promise.
     */
    async findAll() {
        return this.find();
    }
}
