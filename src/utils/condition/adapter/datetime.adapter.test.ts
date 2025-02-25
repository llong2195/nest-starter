import { DateTime } from 'luxon';

import { DateConditionAdapter, DateTimeOperator } from './datetime.adapter';

describe('DateConditionAdapter', () => {
  let adapter: DateConditionAdapter;

  beforeEach(() => {
    adapter = new DateConditionAdapter();
  });

  const leftValue = DateTime.fromISO('2024-01-01T00:00:00.000Z');
  const rightValue = DateTime.fromISO('2024-01-02T00:00:00.000Z');

  it('should return true for equals operator when dates are the same', () => {
    expect(adapter.check(leftValue, leftValue, 'equals')).toBe(true);
  });

  it('should return false for equals operator when dates are different', () => {
    expect(adapter.check(leftValue, rightValue, 'equals')).toBe(false);
  });

  it('should return true for notEquals operator when dates are different', () => {
    expect(adapter.check(leftValue, rightValue, 'notEquals')).toBe(true);
  });

  it('should return false for notEquals operator when dates are the same', () => {
    expect(adapter.check(leftValue, leftValue, 'notEquals')).toBe(false);
  });

  it('should return true for greaterThan operator when left date is after right date', () => {
    expect(adapter.check(rightValue, leftValue, 'greaterThan')).toBe(true);
  });

  it('should return false for greaterThan operator when left date is before right date', () => {
    expect(adapter.check(leftValue, rightValue, 'greaterThan')).toBe(false);
  });

  it('should return true for lessThan operator when left date is before right date', () => {
    expect(adapter.check(leftValue, rightValue, 'lessThan')).toBe(true);
  });

  it('should return false for lessThan operator when left date is after right date', () => {
    expect(adapter.check(rightValue, leftValue, 'lessThan')).toBe(false);
  });

  it('should return true for greaterThanOrEquals operator when left date is after or equals right date', () => {
    expect(adapter.check(rightValue, leftValue, 'greaterThanOrEquals')).toBe(
      true,
    );
    expect(adapter.check(leftValue, leftValue, 'greaterThanOrEquals')).toBe(
      true,
    );
  });

  it('should return false for greaterThanOrEquals operator when left date is before right date', () => {
    expect(adapter.check(leftValue, rightValue, 'greaterThanOrEquals')).toBe(
      false,
    );
  });

  it('should return true for lessThanOrEquals operator when left date is before or equals right date', () => {
    expect(adapter.check(leftValue, rightValue, 'lessThanOrEquals')).toBe(true);
    expect(adapter.check(leftValue, leftValue, 'lessThanOrEquals')).toBe(true);
  });

  it('should return false for lessThanOrEquals operator when left date is after right date', () => {
    expect(adapter.check(rightValue, leftValue, 'lessThanOrEquals')).toBe(
      false,
    );
  });

  it('should throw an error for unsupported operator', () => {
    expect(() =>
      adapter.check(leftValue, rightValue, 'unsupported' as DateTimeOperator),
    ).toThrow('Unsupported operator for date: unsupported');
  });
});
