import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';

import { ValidateError } from '@/common/exceptions/errors';
import { ValidationConfig } from '@/configs';
import { ValidationError } from '@nestjs/common';

/**
 *
 * @returns
 */
export function isDev(): boolean {
  const node_env = process.env.NODE_ENV || 'development';

  return 'development' === node_env;
}

export function isProd(): boolean {
  const node_env = process.env.NODE_ENV || 'development';

  return 'production' === node_env;
}

/**
 *
 * @param env
 * @returns
 */
export function isEnv(env: string): boolean {
  const envSystem = process.env.NODE_ENV || 'development';
  return env === envSystem;
}

/**
 *
 * @param length
 * @returns
 */
export function randomString(length = 10): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const lastIndex = characters.length - 1;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * lastIndex));
  }
  return result;
}

/**
 *
 * @returns
 */
export function getFullDate(): string {
  const now = new Date();
  return `${now.getFullYear()}_${now.getMonth()}_${now.getDay()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}`;
}

/**
 * Converts a Buffer into a readable stream.
 *
 * @param buffer - The buffer to be converted into a stream.
 * @returns A readable stream containing the data from the buffer.
 */
export const bufferToStream = (buffer: Buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

/**
 *
 * @param str
 * @returns
 */
export const base64Encode = (str: string) => {
  const b = Buffer.from(str);
  return b.toString('base64');
};

/**
 *
 * @param str
 * @returns
 */
export const base64Decode = (str: string) => {
  const b = Buffer.from(str, 'base64');
  return b.toString();
};

/**
 *
 * @param min
 * @param max
 * @returns
 */
export const randomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 *
 * @param second
 * @returns
 */
export const currentTimestamp = (second = true): number => {
  if (second) {
    return Math.round(Date.now() / 1000);
  }
  return Date.now();
};

/**
 *
 * @param a
 * @returns
 */
export function uniq<T>(a: T[]): T[] {
  return Array.from(new Set(a));
}

/**
 *
 * @param ms
 * @returns
 */
export const sleep = async (ms: number): Promise<unknown> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const encryptObj = (obj: any, secretKey: string): string => {
  // Generate a random IV (Initialization Vector)
  const iv = randomBytes(16);

  // Create cipher with AES-256-CBC
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(secretKey), null);

  // Encrypt the data
  let encrypted = cipher.update(JSON.stringify(obj), 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Combine IV and encrypted data, then encode to base64
  const combined = Buffer.concat([iv, Buffer.from(encrypted, 'base64')]);
  return combined.toString('base64');
};

export const decryptObj = (encryptText: string, secretKey: string): unknown => {
  // Decode from base64
  const combined = Buffer.from(encryptText, 'base64');

  // Extract IV and encrypted data
  const iv = combined.subarray(0, 16);
  const encrypted = combined.subarray(16);

  // Create decipher
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);

  // Decrypt the data
  let decrypted = decipher.update(encrypted).toString('utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
};

/**
 * Converts an object to a Map<string, string>.
 *
 * @param obj - The object to be converted.
 * @returns The resulting Map<string, string>.
 */
export const objectToFlatMap = (
  obj: Record<string, unknown>,
): Map<string, string> => {
  const map = new Map<string, string>();
  const stack = [{ obj, prefix: '' }];

  while (stack.length > 0) {
    const top = stack.pop();
    if (!top) {
      break;
    }
    const { obj, prefix } = top;

    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        continue;
      }

      if (Array.isArray(obj[key])) {
        (obj[key] as unknown[]).forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            stack.push({
              obj: item as Record<string, unknown>,
              prefix: `${prefix}${key}.${index}.`,
            });
          } else {
            map.set(`${prefix}${key}.${index}`, String(item));
          }
        });
      } else if (typeof obj[key] === 'object') {
        stack.push({
          obj: obj[key] as Record<string, unknown>,
          prefix: `${prefix}${key}.`,
        });
      } else {
        map.set(`${prefix}${key}`, obj[key] as string);
      }
    }
  }
  return map;
};

export const validateDto = async <T>(
  data: unknown,
  cls: ClassConstructor<T>,
): Promise<T> => {
  const obj = plainToInstance(cls, data);
  const options = ValidationConfig;
  const errors = await validate(obj as object, options);
  if (errors.length > 0) {
    function flattenValidationErrors(
      validationErrors: ValidationError[],
    ): string[] {
      return validationErrors
        .map((error) => mapChildrenToValidationErrors(error))
        .flat()
        .filter((item) => !!item.constraints)
        .map((item) =>
          item.constraints ? Object.values(item.constraints) : [],
        )
        .flat();
    }

    function mapChildrenToValidationErrors(
      error: ValidationError,
      parentPath?: string,
    ): ValidationError[] {
      if (!(error.children && error.children.length)) {
        return [error];
      }
      const validationErrors: ValidationError[] = [];
      parentPath = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;
      for (const item of error.children) {
        if (item.children && item.children.length) {
          validationErrors.push(
            ...mapChildrenToValidationErrors(item, parentPath),
          );
        }
        validationErrors.push(
          prependConstraintsWithParentProp(parentPath, item),
        );
      }
      return validationErrors;
    }

    function prependConstraintsWithParentProp(
      parentPath: string,
      error: ValidationError,
    ): ValidationError {
      const constraints: { [key: string]: string } = {};
      for (const key in error.constraints) {
        constraints[key] = `${parentPath}.${error.constraints[key]}`;
      }
      return {
        ...error,
        constraints,
      };
    }

    const errorMessages = flattenValidationErrors(errors).join('; ');
    throw new ValidateError(errorMessages);
  }
  return obj;
};

/**
 * Converts an array to a map using a specified key.
 *
 * @template T - The type of the array elements.
 * @param {T[]} arr - The array to convert.
 * @param {string} key - The key to use for mapping.
 * @returns {Map<string, T>} - The resulting map.
 */
export const arrayToMap = <T>(arr: T[], key: keyof T): Map<string, T> => {
  const map = new Map<string, T>();
  arr.forEach((obj) => {
    if (obj[key] !== undefined) {
      map.set(String(obj[key]), obj);
    }
  });
  return map;
};

/**
 * Converts a Map to an array of its values.
 *
 * @template T - The type of the values in the Map.
 * @param {Map<string, T>} map - The Map to convert.
 * @returns {T[]} An array containing the values from the Map.
 */
export const mapToArray = <T>(map: Map<string, T>): T[] => {
  const arr: T[] = [];
  map.forEach((value) => {
    arr.push(value);
  });
  return arr;
};

/**
 * Removes specified keys from an object.
 *
 * @template T - The type of the object.
 * @param {T} obj - The object from which keys will be removed.
 * @param {Array<keyof T>} keys - An array of keys to be removed from the object.
 */
export const removeKeysFromObj = <T>(obj: T, keys: Array<keyof T>) => {
  // Remove keys from the object
  keys.forEach((key) => {
    delete obj?.[key];
  });
};

/**
 * Attempts to execute a callback function multiple times until it succeeds
 *
 * @param callback - An async function to be executed
 * @param opt - Optional configuration object
 * @param opt.retry - Number of retry attempts (default: 3)
 * @param opt.delay - Delay in milliseconds between retries (default: 1000)
 *
 * @returns A Promise that resolves with the callback's return value
 *
 * @throws Error if all retry attempts fail
 *
 * @example
 * ```typescript
 * const result = await tryToSuccess(
 *   async () => await someAsyncOperation(),
 *   { retry: 5, delay: 2000 }
 * );
 * ```
 */
export const tryToSuccess = async <T>(
  callback: () => Promise<T>,
  opt?: {
    /**
     * Number of retries. Default is 3.
     */
    retry?: number;
    /**
     * Delay in milliseconds before retrying. Default is 1000ms.
     */
    delay?: number;
  },
): Promise<T> => {
  const retry = opt?.retry || 3;
  const delay = opt?.delay || 1000;
  let count = 0;
  while (count < retry) {
    try {
      count++;
      const rs = await callback();
      return rs;
    } catch (error: unknown) {
      console.debug('🚀 ~ error:', error);
      await sleep(delay);
    }
  }
  throw new Error('Try to success failed');
};
