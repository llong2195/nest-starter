import { DateTime } from 'luxon';

import { ValidateError } from '@/common/exceptions/errors';

export class ParseHelper {
  static tryToParseNumber(value: unknown): number {
    const isValidNumber = !isNaN(Number(value));

    if (!isValidNumber) {
      throw new ValidateError(`Value is not a valid number: ${String(value)}`);
    }
    return Number(value);
  }

  static parseRegexPattern(pattern: string): RegExp {
    const regexMatch = (pattern || '').match(
      new RegExp('^/(.*?)/([gimusy]*)$'),
    );
    let regex: RegExp;

    if (!regexMatch) {
      regex = new RegExp((pattern || '').toString());
    } else {
      regex = new RegExp(regexMatch[1], regexMatch[2]);
    }

    return regex;
  }

  static tryToParseString(value: unknown): string {
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'undefined') return '';
    if (
      typeof value === 'string' ||
      typeof value === 'bigint' ||
      typeof value === 'boolean' ||
      typeof value === 'number'
    ) {
      return value.toString();
    }

    return value as string;
  }

  static tryToParseBoolean(value: unknown): value is boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (
      typeof value === 'string' &&
      ['true', 'false'].includes(value.toLowerCase())
    ) {
      return value.toLowerCase() === 'true';
    }

    // If value is not a empty string, try to parse it to a number
    if (!(typeof value === 'string' && value.trim() === '')) {
      const num = Number(value);
      if (num === 0) {
        return false;
      } else if (num === 1) {
        return true;
      }
    }

    throw new ValidateError(
      `Failed to parse value as boolean ${String(value)}`,
    );
  }

  static tryToParseDateTime(value: unknown): DateTime {
    if (value instanceof DateTime && value.isValid) {
      return value;
    }

    if (value instanceof Date) {
      const fromJSDate = DateTime.fromJSDate(value);
      if (fromJSDate.isValid) {
        return fromJSDate;
      }
    }

    const dateString = String(value).trim();

    // Rely on luxon to parse different date formats
    const secondDate = DateTime.fromSeconds(Number(dateString));
    if (secondDate.isValid) {
      return secondDate;
    }

    const isoDate = DateTime.fromISO(dateString, { setZone: true });
    if (isoDate.isValid) {
      return isoDate;
    }
    const httpDate = DateTime.fromHTTP(dateString, { setZone: true });
    if (httpDate.isValid) {
      return httpDate;
    }
    const rfc2822Date = DateTime.fromRFC2822(dateString, { setZone: true });
    if (rfc2822Date.isValid) {
      return rfc2822Date;
    }
    const sqlDate = DateTime.fromSQL(dateString, { setZone: true });
    if (sqlDate.isValid) {
      return sqlDate;
    }

    const parsedDateTime = DateTime.fromMillis(Date.parse(dateString));
    if (parsedDateTime.isValid) {
      return parsedDateTime;
    }

    throw new Error(`Failed to parse date time: ${String(value)}`);
  }

  static tryToParseTime(value: unknown): string {
    const isTimeInput =
      /^\d{2}:\d{2}(:\d{2})?((\\-|\+)\d{4})?((\\-|\+)\d{1,2}(:\d{2})?)?$/s.test(
        String(value),
      );
    if (!isTimeInput) {
      throw new ValidateError(`Value is not a valid time: ${String(value)}`);
    }
    return String(value);
  }

  static tryToParseArray(value: unknown): unknown[] {
    try {
      if (typeof value === 'object' && Array.isArray(value)) {
        return value;
      }

      let parsed: unknown[];
      try {
        parsed = JSON.parse(String(value)) as unknown[];
      } catch (e) {
        parsed = JSON.parse(String(value).replace(/'/g, '"')) as unknown[];
      }

      if (!Array.isArray(parsed)) {
        throw new ValidateError(`Value is not a valid array: ${String(value)}`);
      }
      return parsed;
    } catch (e) {
      throw new ValidateError(`Value is not a valid array: ${String(value)}`);
    }
  }

  static tryToParseObject(value: unknown): object {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value;
    }
    try {
      const o = JSON.parse(String(value)) as object;

      if (typeof o !== 'object' || Array.isArray(o)) {
        throw new ValidateError(
          `Value is not a valid object: ${String(value)}`,
        );
      }
      return o;
    } catch (e) {
      throw new ValidateError(`Value is not a valid object: ${String(value)}`);
    }
  }
}
