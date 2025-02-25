import { ParseHelper } from '../parse.helper';
import { SupportedType } from './condition.type';

export class ConditionHelper {
  static arrayContainsValue(
    array: unknown[],
    value: unknown,
    ignoreCase = false,
  ): boolean {
    if (ignoreCase && typeof value === 'string') {
      return array.some((item) => {
        // if (typeof item !== 'string') {
        //   return false;
        // }
        return (
          typeof item === 'string' && item.toLowerCase() === value.toLowerCase()
        );
      });
    }
    return array.includes(value);
  }

  /**
   * Parses the given value based on the specified type.
   *
   * @param value - The value to be parsed. Can be of any type.
   * @param type - The type to which the value should be parsed. Supported types are 'string', 'number', 'date', and 'object'.
   * @returns An object containing:
   * - `valid`: A boolean indicating whether the parsing was successful.
   * - `errorMessage` (optional): A string containing an error message if the parsing was not successful.
   * - `newValue` (optional): The parsed value if the parsing was successful.
   */
  static tryToParseValue(
    value: unknown,
    type: SupportedType,
  ): { valid: boolean; errorMessage?: string; newValue?: unknown } {
    if (value === null || value === undefined) {
      return { valid: true, newValue: value };
    }

    const defaultErrorMessage = `Value is not a valid ${type}`;

    switch (type) {
      case 'string': {
        try {
          if (typeof value === 'object' && Array.isArray(value)) {
            return {
              valid: true,
              newValue: ParseHelper.tryToParseArray(value),
            };
          }
          return { valid: true, newValue: ParseHelper.tryToParseString(value) };
        } catch (e) {
          return { valid: false, errorMessage: defaultErrorMessage };
        }
      }
      case 'number': {
        try {
          if (typeof value === 'object' && Array.isArray(value)) {
            return {
              valid: true,
              newValue: ParseHelper.tryToParseArray(value),
            };
          }
          return { valid: true, newValue: ParseHelper.tryToParseNumber(value) };
        } catch (e) {
          return { valid: false, errorMessage: defaultErrorMessage };
        }
      }
      case 'date': {
        try {
          return {
            valid: true,
            newValue: ParseHelper.tryToParseDateTime(value),
          };
        } catch (e) {
          return { valid: false, errorMessage: defaultErrorMessage };
        }
      }
      case 'object': {
        try {
          return { valid: true, newValue: ParseHelper.tryToParseObject(value) };
        } catch (e) {
          return { valid: false, errorMessage: defaultErrorMessage };
        }
      }

      // case 'boolean': {
      //   try {
      //     return {
      //       valid: true,
      //       newValue: ParseHelper.tryToParseBoolean(value),
      //     };
      //   } catch (e) {
      //     return { valid: false, errorMessage: defaultErrorMessage };
      //   }
      // }

      // case 'time': {
      //   try {
      //     return { valid: true, newValue: ParseHelper.tryToParseTime(value) };
      //   } catch (e) {
      //     return {
      //       valid: false,
      //       errorMessage: `Expects time (hh:mm:(:ss)) but we got ${value}.`,
      //     };
      //   }
      // }
      // case 'array': {
      //   try {
      //     return { valid: true, newValue: ParseHelper.tryToParseArray(value) };
      //   } catch (e) {
      //     return { valid: false, errorMessage: defaultErrorMessage };
      //   }
      // }

      default: {
        return {
          valid: false,
          errorMessage: `Unsupported type: ${String(type)}`,
        };
      }
    }
  }
}
