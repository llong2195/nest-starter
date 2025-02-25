import { compareSync, hashSync } from 'bcrypt';

import { BCRYPT_SALT } from '@/configs';

export class Hash {
  /**
   * It takes a plain text string or buffer and returns a hashed string
   * @param {string | Buffer} plainText - The plain text password that you want to hash.
   * @param salt - The salt to use when hashing the password.
   * @returns A string
   */
  static make(plainText: string | Buffer, salt = BCRYPT_SALT): string {
    return hashSync(plainText, salt);
  }

  /**
   * It takes a plain text string or buffer and a hash, and returns true if the plain text matches the
   * hash
   * @param {string | Buffer} plainText - The plain text password that you want to hash.
   * @param {string} hash - The hash to compare against.
   * @returns A boolean value.
   */
  static compare(plainText: string | Buffer, hash: string): boolean {
    return compareSync(plainText, hash);
  }
}
