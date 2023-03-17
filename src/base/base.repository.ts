import {
    BaseEntity,
    EntityManager,
    FindManyOptions,
    FindOptionsSelect,
    FindOptionsWhere,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';

import { PAGE_SIZE } from '@config/index';
import { trim } from '@utils/util';

import { PaginationResponse } from './base.dto';

export class BaseRepository<T extends BaseEntity> extends Repository<T> {
    protected _repository: Repository<T>;

    constructor(repository: Repository<T>) {
        super(repository.target, repository.manager, repository.queryRunner);
        this._repository = repository;
    }

    /**
     * It wraps a function in a transaction, and if a transaction manager is passed in, it uses that,
     * otherwise it creates a new one
     * @param operation - (...args) => unknown
     * @param {EntityManager} [manager] - The entity manager that is passed in from the transactionWrap
     * function.
     * @returns The return value of the operation function.
     */
    async transactionWrap(operation: (...args) => unknown, manager?: EntityManager) {
        if (manager != undefined && manager != null) {
            return await operation(manager);
        } else {
            return await this._repository.manager.transaction(async manager => {
                return await operation(manager);
            });
        }
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
        const total = await this._repository.count({ where: options });
        const offset = page === 1 ? 0 : limit * (page - 1);
        const items = await this._repository.find({
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
        const tableName = customTable ?? this._repository.metadata.tableName;

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
