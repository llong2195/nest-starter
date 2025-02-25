import { DateTime } from 'luxon';

import { ValidateError } from '@/common/exceptions/errors';

import { ParseHelper } from './parse.helper';

describe('ParseHelper', () => {
  describe('tryToParseNumber', () => {
    it('should parse a valid number', () => {
      expect(ParseHelper.tryToParseNumber('123')).toBe(123);
    });

    it('should throw an error for an invalid number', () => {
      expect(() => ParseHelper.tryToParseNumber('abc')).toThrow(ValidateError);
    });
  });

  describe('parseRegexPattern', () => {
    it('should parse a valid regex pattern', () => {
      const regex = ParseHelper.parseRegexPattern('/abc/g');
      expect(regex).toEqual(new RegExp('abc', 'g'));
    });

    it('should parse a string as regex pattern', () => {
      const regex = ParseHelper.parseRegexPattern('abc');
      expect(regex).toEqual(new RegExp('abc'));
    });
  });

  describe('tryToParseString', () => {
    it('should parse various types to string', () => {
      expect(ParseHelper.tryToParseString(123)).toBe('123');
      expect(ParseHelper.tryToParseString(true)).toBe('true');
      expect(ParseHelper.tryToParseString({ key: 'value' })).toBe(
        '{"key":"value"}',
      );
    });

    it('should return empty string for undefined', () => {
      expect(ParseHelper.tryToParseString(undefined)).toBe('');
    });
  });

  describe('tryToParseBoolean', () => {
    it('should parse boolean values correctly', () => {
      expect(ParseHelper.tryToParseBoolean(true)).toBe(true);
      expect(ParseHelper.tryToParseBoolean('true')).toBe(true);
      expect(ParseHelper.tryToParseBoolean(1)).toBe(true);
      expect(ParseHelper.tryToParseBoolean(false)).toBe(false);
      expect(ParseHelper.tryToParseBoolean('false')).toBe(false);
      expect(ParseHelper.tryToParseBoolean(0)).toBe(false);
    });

    it('should throw an error for invalid boolean values', () => {
      expect(() => ParseHelper.tryToParseBoolean('abc')).toThrow(ValidateError);
    });
  });

  describe('tryToParseDateTime', () => {
    it('should parse valid DateTime values', () => {
      const date = new Date();
      const dateTime = DateTime.fromJSDate(date);
      expect(ParseHelper.tryToParseDateTime(dateTime)).toEqual(dateTime);
      expect(ParseHelper.tryToParseDateTime(date)).toEqual(dateTime);
    });

    it('should throw an error for invalid DateTime values', () => {
      expect(() => ParseHelper.tryToParseDateTime('invalid date')).toThrow(
        Error,
      );
    });
  });

  describe('tryToParseTime', () => {
    it('should parse valid time strings', () => {
      expect(ParseHelper.tryToParseTime('12:34')).toBe('12:34');
    });

    it('should throw an error for invalid time strings', () => {
      expect(() => ParseHelper.tryToParseTime('invalid time')).toThrow(
        ValidateError,
      );
    });
  });

  describe('tryToParseArray', () => {
    it('should parse valid arrays', () => {
      expect(ParseHelper.tryToParseArray([1, 2, 3])).toEqual([1, 2, 3]);
      expect(ParseHelper.tryToParseArray('[1, 2, 3]')).toEqual([1, 2, 3]);
    });

    it('should throw an error for invalid arrays', () => {
      expect(() => ParseHelper.tryToParseArray('invalid array')).toThrow(
        ValidateError,
      );
    });
  });

  describe('tryToParseObject', () => {
    it('should parse valid objects', () => {
      expect(ParseHelper.tryToParseObject({ key: 'value' })).toEqual({
        key: 'value',
      });
      expect(ParseHelper.tryToParseObject('{"key": "value"}')).toEqual({
        key: 'value',
      });
    });

    it('should throw an error for invalid objects', () => {
      expect(() => ParseHelper.tryToParseObject('invalid-object')).toThrow(
        ValidateError,
      );
    });
  });
});
