import {
  BaseEntity,
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOptionsSelect,
  FindOptionsWhere,
  In,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { EntityId } from 'typeorm/repository/EntityId';

import { PAGE_SIZE } from '@/configs';
import { tranformToEntity } from '@/utils';

import { LoggerService } from '../logger/custom.logger';
import { IBaseService } from './i.base.service';
import { PaginationResponse } from './pagination.dto';

export class BaseService<T extends BaseEntity, R extends Repository<T>>
  implements IBaseService<T>
{
  protected readonly repository: R;
  protected readonly logger: LoggerService;

  constructor(repository: R, logger: LoggerService) {
    this.repository = repository;
    this.logger = logger;
  }

  /**
   * Retrieves an EntityManager instance. If no manager is provided, it logs a warning
   * and returns the default manager from the repository.
   *
   * @param {EntityManager} [manager=null] - The EntityManager instance to use. If not provided, the default manager will be used.
   * @returns {EntityManager} The EntityManager instance to be used.
   */
  getManager(manager?: EntityManager): EntityManager {
    if (!manager) {
      this.logger.warn('No manager provided, using default manager');
      return this.repository.manager;
    }
    return manager;
  }

  /**
   * It wraps a function in a transaction, and if a manager is passed in, it uses that manager,
   * otherwise it creates a new one
   * @param operation - (...args) => unknown
   * @param {EntityManager} [manager] - The entity manager to use. If not provided, a new transaction
   * will be created.
   * @returns The return value of the operation function.
   */
  async transactionWrap<K>(
    runInTransaction: (entityManager: EntityManager) => Promise<K>,
    manager?: EntityManager,
  ): Promise<K> {
    if (manager != undefined) {
      return await runInTransaction(manager);
    } else {
      return await this.repository.manager.transaction(async (manager) => {
        return await runInTransaction(manager);
      });
    }
  }

  /**
   * It updates the entity with the given id and returns the updated entity.
   * @param {EntityId} id - EntityId - The id of the entity to update
   * @param data - QueryDeepPartialEntity<T>
   * @returns The updated entity.
   */
  async _update(
    id: EntityId,
    data: QueryDeepPartialEntity<T>,
  ): Promise<T | null> {
    await this.repository.update(id, data);
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
  async _store(data: DeepPartial<T>): Promise<T | null> {
    return this.repository.save(data);
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
  async _findByIds(ids: EntityId[]): Promise<T[] | null> {
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
  async _iPaginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number = 1,
    limit: number = PAGE_SIZE,
  ): Promise<PaginationResponse<T>> {
    if (page <= 0) {
      page = 1;
    }
    if (limit <= 0) {
      limit = 1;
    }
    const skip = (page - 1) * limit || 0;
    const [items, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return this.pagination<T>(items, total, page, limit);
  }

  /**
   * Similar to @_iPaginate but support order statement with join
   * @param queryBuilder
   * @param page
   * @param limit
   * @returns
   */
  async _iPaginateEx<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    page = 1,
    limit = PAGE_SIZE,
  ): Promise<PaginationResponse<T>> {
    if (page <= 0) {
      page = 1;
    }
    if (limit <= 0) {
      limit = 1;
    }
    const skip = (page - 1) * limit || 0;
    const [items, total] = await queryBuilder
      .limit(limit)
      .offset(skip)
      .getManyAndCount();

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
  async _iPaginateCustom<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    page = 1,
    limit = PAGE_SIZE,
    customTable?: string,
  ): Promise<PaginationResponse<T>> {
    if (page <= 0) {
      page = 1;
    }
    if (limit <= 0) {
      limit = 1;
    }
    const skip = (page - 1) * limit || 0;

    const [data, total] = await Promise.all([
      queryBuilder.limit(limit).offset(skip).getRawMany(),
      queryBuilder.getCount(),
    ]);
    const tableName = customTable ?? this.repository.metadata.tableName;

    const results: T[] = this.tranformToEntity<T>(
      data as Record<string, unknown>[],
      tableName,
    );
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
  pagination<T>(
    items: T[],
    total: number,
    page = 1,
    limit = PAGE_SIZE,
  ): PaginationResponse<T> {
    return PaginationResponse.create<T>(items, total, page, limit);
  }

  tranformToEntity<T>(data: Record<string, unknown>[], tableName: string): T[] {
    return tranformToEntity(data, tableName);
  }
}
