import {
  arrayToMap,
  base64Decode,
  base64Encode,
  decryptObj,
  encryptObj,
  isDev,
  isEnv,
  isProd,
  mapToArray,
  objectToFlatMap,
  randomInt,
  randomString,
  removeKeysFromObj,
  tryToSuccess,
  uniq,
} from './util';

describe('Utility Functions', () => {
  describe('Environment checks', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    test('isDev should return true in development', () => {
      process.env.NODE_ENV = 'development';
      expect(isDev()).toBe(true);
    });

    test('isProd should return true in production', () => {
      process.env.NODE_ENV = 'production';
      expect(isProd()).toBe(true);
    });

    test('isEnv should check environment correctly', () => {
      process.env.NODE_ENV = 'test';
      expect(isEnv('test')).toBe(true);
    });
  });

  describe('String operations', () => {
    test('randomString should generate string of specified length', () => {
      expect(randomString(10)).toHaveLength(10);
      expect(randomString()).toHaveLength(10); // default length
    });

    test('base64 encode/decode', () => {
      const original = 'test string';
      const encoded = base64Encode(original);
      expect(base64Decode(encoded)).toBe(original);
    });
  });

  describe('Array/Object operations', () => {
    test('randomInt should generate number within range', () => {
      const num = randomInt(1, 10);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(10);
    });

    test('uniq should remove duplicates', () => {
      expect(uniq([1, 1, 2, 2, 3])).toEqual([1, 2, 3]);
    });

    test('objectToFlatMap should flatten nested object', () => {
      const obj = { a: 1, b: { c: 2 } };
      const map = objectToFlatMap(obj);
      console.log('🚀 ~ test ~ map:', map);
      expect(map.get('a')).toBe(1);
      expect(map.get('b.c')).toBe(2);
    });

    test('arrayToMap should convert array to map', () => {
      const arr = [{ id: '1', value: 'test' }];
      const map = arrayToMap(arr, 'id');
      expect(map.get('1')).toEqual({ id: '1', value: 'test' });
    });

    test('mapToArray should convert map to array', () => {
      const map = new Map([['1', { id: '1', value: 'test' }]]);
      const arr = mapToArray(map);
      expect(arr).toEqual([{ id: '1', value: 'test' }]);
    });

    test('removeKeysFromObj should remove specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      removeKeysFromObj(obj, ['a', 'b']);
      expect(obj).toEqual({ c: 3 });
    });
  });

  describe('Encryption', () => {
    const secretKey = '0123456789abcdef0123456789abcdef'; // 32 bytes for AES-256

    test('encryptObj/decryptObj should encrypt and decrypt object', () => {
      const original = { test: 'data' };
      const encrypted = encryptObj(original, secretKey);
      const decrypted = decryptObj(encrypted, secretKey);
      expect(decrypted).toEqual(original);
    });
  });

  describe('Async operations', () => {
    test('tryToSuccess should retry failed operations', async () => {
      let attempts = 0;
      const callback = async () => {
        attempts++;
        if (attempts < 2) throw new Error('Failed attempt');
        return Promise.resolve('success');
      };

      const result = await tryToSuccess(callback, { retry: 3, delay: 100 });
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    test('tryToSuccess should throw after max retries', async () => {
      const callback = () => {
        throw new Error('Always fails');
      };

      await expect(
        tryToSuccess(callback, { retry: 2, delay: 100 }),
      ).rejects.toThrow('Try to success failed');
    });
  });
});
