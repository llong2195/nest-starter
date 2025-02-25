import { DateTime } from 'luxon';

import { ConditionHelper } from './condition.helper';
import { SupportedType } from './condition.type';

describe('ConditionHelper', () => {
  describe('arrayContainsValue', () => {
    it('should return true if the array contains the value', () => {
      const array = [1, 2, 3, 'test'];
      const value = 2;
      expect(ConditionHelper.arrayContainsValue(array, value)).toBe(true);
    });

    it('should return false if the array does not contain the value', () => {
      const array = [1, 2, 3, 'test'];
      const value = 4;
      expect(ConditionHelper.arrayContainsValue(array, value)).toBe(false);
    });

    it('should return true if the array contains the string value ignoring case', () => {
      const array = ['apple', 'banana', 'Cherry'];
      const value = 'cherry';
      expect(ConditionHelper.arrayContainsValue(array, value, true)).toBe(true);
    });

    it('should return false if the array does not contain the string value ignoring case', () => {
      const array = ['apple', 'banana', 'Cherry'];
      const value = 'grape';
      expect(ConditionHelper.arrayContainsValue(array, value, true)).toBe(
        false,
      );
    });

    it('should return true if the array contains the string value with exact case', () => {
      const array = ['apple', 'banana', 'Cherry'];
      const value = 'Cherry';
      expect(ConditionHelper.arrayContainsValue(array, value)).toBe(true);
    });

    it('should return false if the array does not contain the string value with exact case', () => {
      const array = ['apple', 'banana', 'Cherry'];
      const value = 'cherry';
      expect(ConditionHelper.arrayContainsValue(array, value)).toBe(false);
    });

    it('should return true if the array contains the value of different types', () => {
      const array = [1, '2', true, null];
      const value = '2';
      expect(ConditionHelper.arrayContainsValue(array, value)).toBe(true);
    });

    it('should return false if the array does not contain the value of different types', () => {
      const array = [1, '2', true, null];
      const value = false;
      expect(ConditionHelper.arrayContainsValue(array, value)).toBe(false);
    });
  });

  describe('tryToParseValue', () => {
    it('should return valid true and newValue as null if value is null', () => {
      const result = ConditionHelper.tryToParseValue(null, 'string');
      expect(result).toEqual({ valid: true, newValue: null });
    });

    it('should return valid true and newValue as undefined if value is undefined', () => {
      const result = ConditionHelper.tryToParseValue(undefined, 'string');
      expect(result).toEqual({ valid: true, newValue: undefined });
    });

    it('should parse string value correctly', () => {
      const result = ConditionHelper.tryToParseValue('test', 'string');
      expect(result).toEqual({ valid: true, newValue: 'test' });
    });

    it('should parse string value correctly', () => {
      const result = ConditionHelper.tryToParseValue(123, 'string');
      expect(result).toEqual({
        valid: true,
        newValue: '123',
      });
    });

    it('should parse number value correctly', () => {
      const result = ConditionHelper.tryToParseValue('123', 'number');
      expect(result).toEqual({ valid: true, newValue: 123 });
    });

    it('should return error for invalid number value', () => {
      const result = ConditionHelper.tryToParseValue('abc', 'number');
      expect(result).toEqual({
        valid: false,
        errorMessage: 'Value is not a valid number',
      });
    });

    it('should parse date value correctly', () => {
      const now = new Date();
      const newValue = DateTime.fromJSDate(now);
      const result = ConditionHelper.tryToParseValue('2023-01-01', 'date');
      expect(result).toEqual({
        valid: true,
        newValue: newValue,
      });
    });

    it('should return error for invalid date value', () => {
      const result = ConditionHelper.tryToParseValue('invalid-date', 'date');
      expect(result).toEqual({
        valid: false,
        errorMessage: 'Value is not a valid date',
      });
    });

    it('should parse object value correctly', () => {
      const result = ConditionHelper.tryToParseValue(
        '{"key": "value"}',
        'object',
      );
      expect(result).toEqual({ valid: true, newValue: { key: 'value' } });
    });

    it('should return error for invalid object value', () => {
      const result = ConditionHelper.tryToParseValue(
        'invalid-object',
        'object',
      );
      expect(result).toEqual({
        valid: false,
        errorMessage: 'Value is not a valid object',
      });
    });

    it('should return error for unsupported type', () => {
      const result = ConditionHelper.tryToParseValue(
        'test',
        'unsupported' as SupportedType,
      );
      expect(result).toEqual({
        valid: false,
        errorMessage: 'Unsupported type: unsupported',
      });
    });
  });
});
