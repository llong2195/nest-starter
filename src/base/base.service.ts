import { LoggerService } from 'src/logger/custom.logger';
import {
    BaseEntity,
    EntityManager,
    FindManyOptions,
    FindOptionsOrder,
    FindOptionsSelect,
    FindOptionsWhere,
    In,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { EntityId } from 'typeorm/repository/EntityId';

import { PAGE_SIZE } from '@src/configs/config';
import { pagination, trim } from '@utils/index';

import { PaginationResponse } from './base.dto';
import { IBaseService } from './i.base.service';

export class BaseService<T extends BaseEntity, R extends Repository<T>> implements IBaseService<T> {
    protected readonly repository: R;
    protected readonly logger: LoggerService;

    constructor(repository: R, logger: LoggerService) {
        this.repository = repository;
        this.logger = logger;
    }

    /**
     * It wraps a function in a transaction, and if a manager is passed in, it uses that manager,
     * otherwise it creates a new one
     * @param operation - (...args) => unknown
     * @param {EntityManager} [manager] - The entity manager to use. If not provided, a new transaction
     * will be created.
     * @returns The return value of the operation function.
     */
    async transactionWrap(operation: (...args) => unknown, manager?: EntityManager) {
        if (manager != undefined) {
            return await operation(manager);
        } else {
            return await this.repository.manager.transaction(async manager => {
                return await operation(manager);
            });
        }
    }

    /**
     * It returns a list of entities that are deleted or not deleted.
     * @param {boolean} deleted - boolean - this is the deleted flag that we want to search for.
     * @param {boolean} sort - boolean - if true, sort by ascending order, else sort by descending
     * order
     * @param page - 0 - The page number to return.
     * @returns An array of objects of type T.
     */
    async _findByDeleted(deleted: boolean, sort: boolean, page: 0): Promise<T[] | null> {
        return await this.repository.find({
            where: { deleted: deleted } as unknown as FindOptionsWhere<T>,
            skip: page * PAGE_SIZE,
            take: PAGE_SIZE,
            order: { createdAt: sort ? 1 : -1 } as unknown as FindOptionsOrder<T>,
        });
    }

    /**
     * It counts the number of entities in the database that have a deleted property equal to the deleted
     * parameter.
     * @param {boolean} deleted - boolean - This is the value of the deleted column that we want to count.
     * @returns The number of entities that match the given criteria.
     */
    async _countByDeleted(deleted: boolean): Promise<number | null> {
        return await this.repository.count({
            where: { deleted: deleted } as unknown as FindOptionsWhere<T>,
        });
    }

    /**
     * It updates the entity with the given id and returns the updated entity.
     * @param {EntityId} id - EntityId - The id of the entity to update
     * @param data - QueryDeepPartialEntity<T>
     * @returns The updated entity.
     */
    async _update(id: EntityId, data: QueryDeepPartialEntity<T>): Promise<T | null> {
        await this.repository.update(id, data as QueryDeepPartialEntity<T>);
        return await this.repository.findOne({
            where: { id: id } as unknown as FindOptionsWhere<T>,
        });
    }

    /**
     * It updates the deleted field of the entity with the given id to true, and then returns the
     * updated entity
     * @param {EntityId} id - EntityId - The id of the entity to be deleted.
     * @returns The updated entity.
     */
    async _softDelete(id: EntityId): Promise<T | null> {
        await this.repository.update(id, {
            deleted: true,
        } as unknown as QueryDeepPartialEntity<T>);
        return await this.repository.findOne({
            where: { id: id } as unknown as FindOptionsWhere<T>,
        });
    }

    /**
     * It restores a deleted entity
     * @param {EntityId} id - EntityId - The id of the entity to restore
     * @returns The updated entity.
     */
    async _restore(id: EntityId): Promise<T | null> {
        await this.repository.update(id, {
            deleted: false,
        } as unknown as QueryDeepPartialEntity<T>);
        return await this.repository.findOne({
            where: { id: id } as unknown as FindOptionsWhere<T>,
        });
    }

    /**
     * It deletes the entity with the given id and returns the deleted entity
     * @param {EntityId} id - EntityId - The id of the entity to be deleted.
     * @returns The entity that was deleted.
     */
    async _destroy(id: EntityId): Promise<T | null> {
        const entity = await this._findById(id);
        await this.repository.delete(id);
        return entity;
    }

    /**
     * It takes in a data object, saves it to the database, and returns the saved object
     * @param {any} data - any - This is the data that will be stored in the database.
     * @returns The data that was saved to the database.
     */
    async _store(data: any): Promise<T | null> {
        return this.repository.save(data, { transaction: true });
    }

    /**
     * > Finds a single entity by its id
     * @param {EntityId} id - EntityId - The id of the entity to find.
     * @returns A promise of a single entity or null.
     */
    async _findById(id: EntityId): Promise<T | null> {
        return this.repository.findOne({
            where: { id: id } as unknown as FindOptionsWhere<T>,
        });
    }

    /**
     * > It returns a promise of an array of entities, or null if the array is empty
     * @param ids - [EntityId] - an array of entity ids
     * @returns An array of entities or null.
     */
    async _findByIds(ids: [EntityId]): Promise<T[] | null> {
        return this.repository.find({
            where: { id: In(ids) } as unknown as FindOptionsWhere<T>,
        });
    }

    /**
     * It takes a page number, a limit, and some options, and returns a paginated response
     * @param {number} page - number - The page number to return
     * @param {number} limit - number = PAGE_SIZE,
     * @param {FindOptionsWhere<T> | FindOptionsWhere<T>[]} [options] - This is the where clause for
     * the query.
     * @param [fields] - The fields you want to select from the database.
     * @param [manyOptions] - FindManyOptions<T>
     * @returns A pagination response object
     */
    async _paginate(
        page: number,
        limit: number = PAGE_SIZE,
        options?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
        fields?: FindOptionsSelect<T>,
        manyOptions?: FindManyOptions<T>,
    ): Promise<PaginationResponse<T>> {
        const total = await this.repository.count({ where: options });
        const offset = page === 1 ? 0 : limit * (page - 1);
        const items = await this.repository.find({
            where: options,
            select: fields,
            skip: offset,
            take: limit,
            ...manyOptions,
        });

        return this.pagination<T>(items, total, page, limit);
    }

    /**
     * It takes a query builder, a page number, and a limit, and returns a pagination response
     * @param queryBuilder - SelectQueryBuilder<T> - The query builder that you want to paginate.
     * @param {number} page - The page number to return.
     * @param {number} limit - The number of items to return per page.
     * @returns A pagination response object
     */
    async _iPaginate<T>(
        queryBuilder: SelectQueryBuilder<T>,
        page: number,
        limit: number,
    ): Promise<PaginationResponse<T>> {
        const skip = (page - 1) * limit;
        const [items, total] = await queryBuilder.take(limit).skip(skip).getManyAndCount();

        return this.pagination<T>(items, total, page, limit);
    }

    /**
     * It takes a query builder, a page number, a limit, and a custom table name (optional) and returns
     * a pagination response
     * @param queryBuilder - SelectQueryBuilder<T>
     * @param {number} page - number,
     * @param {number} limit - The number of items to return per page.
     * @param [customTable=null] - This is the table name that you want to use for the query. If you
     * don't pass this, it will use the table name of the repository.
     * @returns {PaginationResponse} A pagination response object
     */
    async iPaginateCustom<T>(
        queryBuilder: SelectQueryBuilder<T>,
        page: number,
        limit: number,
        customTable = null,
    ): Promise<PaginationResponse<T>> {
        const skip = (page - 1) * limit;

        const total = await queryBuilder.getCount();
        const data = await queryBuilder.take(limit).skip(skip).getRawMany();
        const tableName = customTable ?? this.repository.metadata.tableName;

        const results: T[] = data.map(item => {
            const a: Record<string, unknown> = {};

            Object.keys(item).forEach(key => {
                if (key.lastIndexOf('id') === key.length - 2) {
                    a[trim(key, tableName + '_')] = parseInt(item[key], 10);
                } else {
                    a[trim(key, tableName + '_')] = item[key];
                }
            });
            return a as T;
        });

        return this.pagination<T>(results, total, page, limit);
    }

    /**
     * It takes an array of items, a total number of items, a page number, and a page size, and returns
     * a paginated response object
     * @param {T[]} items - The items to be paginated.
     * @param {number} total - The total number of items in the database.
     * @param {number} [page=1] - The current page number
     * @param {number} limit - The number of items per page.
     * @returns {PaginationResponse} A new instance of the PaginationResponse class.
     */
    pagination<T>(items: T[], total: number, page = 1, limit = PAGE_SIZE): PaginationResponse<T> {
        const totalPage = Math.ceil(total / limit);
        if (total <= 0 || page > totalPage) {
            return new PaginationResponse([], {
                pagination: {
                    currentPage: page,
                    limit: limit,
                    total: 0,
                    totalPages: 0,
                },
            });
        }
        return new PaginationResponse(items, {
            pagination: {
                currentPage: Number(page),
                limit: limit,
                total: total,
                totalPages: totalPage,
            },
        });
    }

    /**
     * It returns the current timestamp in seconds or milliseconds
     * @param [second=true] - boolean - If true, the timestamp will be in seconds. If false, the
     * timestamp will be in milliseconds.
     * @returns A timestamp in seconds or milliseconds.
     */
    async currentTimestamp(second = true): Promise<number> {
        const date = new Date();
        if (second) {
            const now = Math.floor(date.getTime() / 1000);
            return now;
        }
        return Date.now();
    }
}
