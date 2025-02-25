import { Transform } from 'class-transformer';

/**
 * A transformer function that converts input to an array
 * @param separator - Optional string used to split strings into arrays (defaults to ',')
 * @returns A transformed array based on the input:
 * - If input is null/undefined returns empty array
 * - If input is already an array returns as-is
 * - If input is string splits by separator
 * - Otherwise wraps input in array
 * @example
 * ```typescript
 * // Using default separator ','
 * @ConvertToArray()
 * myProperty: string[] // "a,b,c" -> ["a","b","c"]
 *
 * // Using custom separator
 * @ConvertToArray("|")
 * myProperty: string[] // "a|b|c" -> ["a","b","c"]
 * ```
 */
export const ConvertToArray = (separator?: string) => {
  return Transform(({ value }: { value: string | string[] }) => {
    separator = separator || ',';
    const values: string | string[] = value;
    if (values == null || values == undefined) {
      return [];
    }
    return Array.isArray(values)
      ? values
      : typeof values == 'string'
        ? values.split(separator)
        : [values];
  });
};

/**
 * A decorator transformer that converts string input into an array of numbers.
 *
 * @param separator - Optional string separator used to split the input string. Defaults to ','.
 * @returns A transformer function that converts input to number array
 *
 * @example
 * // Using default separator ','
 * @ConvertToArrayOfNumbers()
 * property: number[]; // "1,2,3" -> [1,2,3]
 *
 * @example
 * // Using custom separator
 * @ConvertToArrayOfNumbers('|')
 * property: number[]; // "1|2|3" -> [1,2,3]
 *
 * @remarks
 * - If input is null or undefined, returns empty array
 * - If input is already an array, processes each element
 * - Non-numeric values are filtered out
 * - NaN values are filtered out
 */
export const ConvertToArrayOfNumbers = (separator?: string) => {
  return Transform(({ value }: { value: string | string[] }) => {
    separator = separator || ',';
    const values = value;

    if (values == null || values == undefined) {
      return [];
    }

    return (
      Array.isArray(values)
        ? values
        : typeof values == 'string'
          ? values.split(separator)
          : [values]
    )
      .map((value: string) => Number(value))
      .filter((value: number) => !isNaN(value));
  });
};

/**
 * A decorator transformer that converts various string and number values to boolean.
 *
 * @returns A Transform decorator that converts input values to boolean
 *
 * @example
 * class Example {
 *   @ConvertToBoolean()
 *   isEnabled: boolean;
 * }
 *
 * @remarks
 * - Converts 'true', '1', and 1 to `true`
 * - Converts 'false', '0', and 0 to `false`
 * - Returns original value if null or undefined
 * - For other values, uses JavaScript's Boolean() conversion
 */
export const ConvertToBoolean = () => {
  return Transform(({ value }: { value: string | number }) => {
    const trueValues = ['true', '1', 1];
    const falseValues = ['false', '0', 0];

    if (value == null || value == undefined) {
      return value;
    }

    if (trueValues.includes(value)) {
      return true;
    }
    if (falseValues.includes(value)) {
      return false;
    }

    return Boolean(value);
  });
};
