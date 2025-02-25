import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export interface IBaseService<T> {
  _update(id: number, data: QueryDeepPartialEntity<T>): Promise<T | T[] | null>;

  _softDelete(id: number): Promise<T | null>;

  _restore(id: number): Promise<T | null>;

  _destroy(id: number): Promise<T | null>;

  _store(data: any): Promise<T | null>;

  _findById(id: number): Promise<T | null>;

  _findByIds(ids: [number]): Promise<T[] | null>;
}
