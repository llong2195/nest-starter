import Redis, { RedisOptions } from 'ioredis';

import { Injectable, Logger, Optional } from '@nestjs/common';

@Injectable()
export class RedisComponent {
  static cacheInstance = new Map<number, RedisComponent>();
  private redis: Redis;
  private logger = new Logger(RedisComponent.name);

  constructor(@Optional() redisDb?: number) {
    const url = process.env.REDIS_URL || '';
    const useTls = parseInt(process.env.REDIS_TLS || '0') == 1;
    const host = process.env.REDIS_HOST;
    const port = parseInt(process.env.REDIS_PORT || '6379');
    const password = process.env.REDIS_PASS;
    const username = process.env.REDIS_USER || '';
    const db = redisDb ? redisDb : parseInt(process.env.REDIS_DB || '0') || 0;
    const redisOption: RedisOptions = {
      host: host,
      port: port,
      username: username,
      password: password,
      db,
      tls: useTls ? {} : undefined,
    };

    try {
      this.redis = url ? new Redis(url) : new Redis(redisOption);
      this.redis.on('ready', () => {
        this.logger.log('Redis connected');
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  static getInstance(db = 0) {
    let instance = RedisComponent.cacheInstance.get(db);
    if (!instance || instance?.getClient()?.status !== 'ready') {
      instance = new RedisComponent(db);
      RedisComponent.cacheInstance.set(db, instance);
    }
    return instance;
  }

  /**
   * It returns the redis client
   * @returns The redis client.
   */
  getClient() {
    return this.redis;
  }

  /**
   * It sets a key in the redis cache.
   * @param {string} key - The key to store the data in.
   * @param {string | number | Buffer} data - The data to be stored in the cache.
   * @param [expireTime=60] - The expiration time of the key, in seconds. If it is 0, it will not expire.
   * @returns A promise that resolves to the string 'OK'
   */
  async set(key: string, data: string | number | Buffer, expireTime = 60) {
    if (data !== null) {
      if (expireTime === 0) {
        return this.redis.set(key, data);
      } else {
        return this.redis.set(key, data, 'EX', expireTime);
      }
    }
  }

  /**
   * It returns a promise that resolves to the value of the key in the Redis database
   * @param {string} key - The key to get the value of.
   * @returns A promise that resolves to a string or null.
   */
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  /**
   * It sets a key in redis with a value of data and an expiration time of expireTime.
   * @param {string} key - The key to store the data under.
   * @param {any | Record<string, unknown>} data - The data to be stored in the cache.
   * @param [expireTime=60] - The expiration time of the cache, in seconds. If it is 0, it will not
   * expire.
   * @returns A promise that resolves to the string 'OK'
   */
  async setJson(key: string, data: Record<string, unknown>, expireTime = 60) {
    if (data !== null) {
      if (expireTime === 0) {
        return await this.redis.set(key, JSON.stringify(data));
      } else {
        return await this.redis.set(
          key,
          JSON.stringify(data),
          'EX',
          expireTime || 60,
        );
      }
    }
  }

  /**
   * It returns a promise that resolves to the value of the key in the cache, or null if the key
   * doesn't exist
   * @param {string} key - The key to get the value from
   * @returns T
   */
  async getJson<T>(key: string) {
    const data = await this.redis.get(key);
    if (data !== null && data !== '') {
      return JSON.parse(data) as T;
    }
    return null;
  }

  /**
   * This function sets the value of a hash field.
   * The first parameter is the key of the hash. The second parameter is the field of the hash. The
   * third parameter is the value of the hash field
   * @param {string} key - The key of the hash
   * @param {string} field - The field to set.
   * @param {string | number} value - string | number
   * @returns The number of fields that were added.
   */
  async hSet(key: string, field: string, value: string | number) {
    return this.redis.hset(key, field, value);
  }

  /**
   * HmSet() takes a key and a Map of fields and values, and returns a Promise that resolves to 'OK'
   * if the operation was successful.
   * @param {string} key - The key of the hashmap
   * @param fields - Map<string, any>
   * @returns A promise that resolves to the string 'OK'
   */
  async hmSet(key: string, fields: Map<string, any>) {
    return this.redis.hmset(key, fields);
  }

  /**
   * It returns a promise that resolves to the value of the field in the hash stored at key
   * @param {string} key - The key of the hash
   * @param {string} field - The field to get the value of.
   * @returns A promise that resolves to a string.
   */
  async hGet(key: string, field: string) {
    return this.redis.hget(key, field);
  }

  /**
   * It gets a JSON object from a hash.
   * @param {string} key - The key of the hash
   * @param {string} field - The field to get the value from
   * @returns A Promise that resolves to null or T
   */
  async hGetJson<T>(key: string, field: string) {
    try {
      const data = await this.redis.hget(key, field);
      if (data !== null && data !== '') {
        return JSON.parse(data) as T;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  /**
   * It returns a promise that resolves to a hashmap of key-value pairs
   * @param {string} key - The key to get the hash from.
   * @returns A promise that resolves to an object with the key/value pairs of the hash.
   */
  async hGetAll(key: string) {
    return this.redis.hgetall(key);
  }

  /**
   * This function deletes a key from a hash.
   * @param {string} name - The name of the hash
   * @param {string} key - The name of the hash
   * @returns The number of fields that were removed from the hash, not including specified but non
   * existing fields.
   */
  async hDel(name: string, key: string) {
    return this.redis.hdel(name, key);
  }

  /**
   * It deletes a key from the Redis database
   * @param {string} key - The key to delete
   * @returns The number of keys that were deleted.
   */
  async delete(key: string) {
    return this.redis.del(key);
  }

  /**
   * It deletes the key from the Redis database
   * @param {string[]} key - The key to be deleted.
   * @returns The number of keys that were removed.
   */
  async deleteArr(key: string[]) {
    return this.redis.del(key);
  }

  /**
   * It pushes data to the left of a list.
   * @param {string} key - The key of the list
   * @param {string | number} data - The data to be pushed to the list.
   * @returns The number of elements in the list after the push operation.
   */
  async lPush(key: string, data: string | number) {
    if (data !== null) {
      return this.redis.lpush(key, data);
    }
    return 0;
  }

  /**
   * It pushes data to the right side of a list
   * @param {string} key - The key of the list you want to push to.
   * @param {string | number} data - The data to be pushed to the list.
   * @returns The number of elements in the list after the push operation.
   */
  async rPush(key: string, data: string | number) {
    if (data !== null) {
      return this.redis.rpush(key, data);
    }
    return 0;
  }

  /**
   * It returns the first element of a list
   * @param {string} key - The key of the list you want to pop from.
   * @returns The first element of the list stored at key.
   */
  async lPop(key: string) {
    return await this.redis.lpop(key);
  }

  /**
   * It removes the last element from the list.
   * @param {string} key - The key of the list you want to pop from.
   * @returns The last element of the list stored at key.
   */
  async rPop(key: string) {
    return await this.redis.rpop(key);
  }

  /**
   * "Increment the value of a key in a hash by a given amount."
   *
   * The first parameter is the name of the hash. The second parameter is the name of the key. The
   * third parameter is the amount to increment the value by
   * @param {string} name - The name of the hash
   * @param {string} key - The name of the hash
   * @param {number} value - number - The value to increment by
   * @returns The value of the key after the increment.
   */
  async inc(name: string, key: string, value: number) {
    return this.redis.hincrby(name, key, value);
  }

  /**
   * Adds the specified members to the set stored at key. Specified members that are already a member
   * of this set are ignored. If key does not exist, a new set is created before adding the specified
   * members.
   * @param {string} key - The key of the set you want to add to.
   * @param {(string | Buffer | number)[]} value - (string | Buffer | number)[]
   * @returns The number of elements added to the set, not including all the elements already present
   * into the set.
   */
  async sAdd(key: string, value: (string | Buffer | number)[]) {
    if (value !== null) {
      return this.redis.sadd(key, value);
    }
    return null;
  }

  /**
   * It returns a boolean value indicating whether the value is a member of the set stored at key
   * @param {string} key - The key of the set.
   * @param {string | number | Buffer} value - The value to check for in the set.
   * @returns A boolean value.
   */
  async sisMember(
    key: string,
    value: string | number | Buffer,
  ): Promise<boolean> {
    if (value !== null) {
      const ret = await this.redis.sismember(key, value);
      return !!ret;
    }
    return false;
  }

  /**
   * It returns all the members of the set value stored at key.
   * @param {string} key - The key of the set you want to get the members of.
   * @returns An array of strings
   */
  async sMember(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  /**
   * "Given an array of keys, and an array of ids, return a map of ids to values."
   *
   * The function is generic, so it can return any type of value
   * @param {string[]} keys - string[] - An array of keys to get from redis
   * @param {number[]} mapTo - The array of ids that the keys are mapped to.
   * @returns A map of the id to the value
   */
  async gets<T>(keys: string[], mapTo: number[]): Promise<Map<number, T>> {
    const result = await this.redis.mget(keys);

    const mapped: Map<number, T> = new Map<number, T>();

    mapTo.forEach((id, index) => {
      mapped.set(id, result[index] as unknown as T);
    });

    return mapped;
  }

  /**
   * It returns all the keys in the database.
   * @returns A promise that resolves to an array of strings.
   */
  async getKeys(): Promise<string[]> {
    return this.redis.keys('*');
  }

  /**
   * It returns a promise that resolves to an array of strings
   * @param {string} key - string - The key to search for.
   * @returns An array of strings
   */
  async getByKeys(key: string): Promise<string[]> {
    return await this.redis.keys(`${key}*`);
  }

  /**
   * It takes an array of keys and deletes them all
   * @param {string[]} keys - An array of keys to delete.
   */
  async deleteKeys(keys: string[]): Promise<number[]> {
    return Promise.all(keys.map((key) => this.delete(key)));
  }
}
