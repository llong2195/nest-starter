import { TypeORMError } from 'typeorm';

// https://github.com/typeorm/typeorm/blob/master/src/query-builder/ReturningResultsEntityUpdator.ts#L89
// https://github.com/typeorm/typeorm/blob/master/src/query-builder/ReturningResultsEntityUpdator.ts#L217
export const TypeORMErrorUpsert =
  'Cannot update entity because entity id is not set in the entity.';

export const handleCatchUpsert = (error: unknown) => {
  if (!(error instanceof TypeORMError && error.message == TypeORMErrorUpsert)) {
    throw error;
  }
};

export const warpUpsert = async <T>(callback: Promise<T>) => {
  try {
    return await callback;
  } catch (error) {
    handleCatchUpsert(error);
  }
};

/**
 * It takes a string, removes the first and last characters of the string, and returns the result
 * @param {string} str - The string to be trimmed.
 * @param {string} trim_str - The string to trim from the beginning and end of the string.
 */
export const trim = (str: string, trim_str: string) => {
  const reg = new RegExp(`^${trim_str}+|${trim_str}+$`, 'gm');
  return toCamelCase(str.replace(reg, ''));
};

/**
 *
 * @param str
 * @returns
 * @link https://github.com/typeorm/typeorm/blob/e7649d2746f907ff36b1efb600402dedd5f5a499/src/util/StringUtils.ts#L20
 */
export const toSnakeCase = (str: string): string => {
  return (
    str
      // ABc -> a_bc
      .replace(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3')
      // aC -> a_c
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase()
  );
};

/**
 *
 * @param str
 * @param firstCapital
 * @returns
 * @link https://github.com/typeorm/typeorm/blob/e7649d2746f907ff36b1efb600402dedd5f5a499/src/util/StringUtils.ts#L8
 */
export const toCamelCase = (str: string, firstCapital = false): string => {
  if (firstCapital) str = ' ' + str;
  return str.replace(
    /^([A-Z])|[\s-_](\w)/g,
    function (match, p1: string, p2: string) {
      if (p2) {
        return p2.toUpperCase();
      }
      return p1.toLowerCase();
    },
  );
};

/**
 * Transforms an array of database records into an array of entity objects by removing table name prefixes from keys.
 *
 * @template T - The target entity type
 * @param data - Array of database records with table name prefixed keys
 * @param tableName - The name of the database table (used to remove prefix from keys)
 * @returns Array of transformed entity objects of type T
 *
 * @example
 * // If tableName is "user" and data contains [{user_id: 1, user_name: "John"}]
 * // Returns [{id: 1, name: "John"}]
 */
export const tranformToEntity = <T>(
  data: Record<string, unknown>[],
  tableName: string,
): T[] => {
  const prefix = tableName + '_';

  return data.map((item) => {
    const a: Record<string, unknown> = {};

    Object.keys(item).forEach((key) => {
      a[trim(key, prefix)] = item[key];
    });

    return a as T;
  });
};
