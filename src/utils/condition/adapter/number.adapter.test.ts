import { NumberConditionAdapter } from './number.adapter';

describe('NumberConditionAdapter', () => {
  let adapter: NumberConditionAdapter;

  beforeEach(() => {
    adapter = new NumberConditionAdapter();
  });

  describe('lessThan', () => {
    it('should return true when leftValue is less than rightValue', () => {
      expect(adapter.check(5, 10, 'lessThan')).toBe(true);
    });

    it('should return false when leftValue is not less than rightValue', () => {
      expect(adapter.check(10, 5, 'lessThan')).toBe(false);
    });

    it('should return true when leftValue is less than any value in rightValue array', () => {
      expect(adapter.check(5, [10, 20, 30], 'lessThan')).toBe(true);
    });

    it('should return false when leftValue is not less than any value in rightValue array', () => {
      expect(adapter.check(35, [10, 20, 30], 'lessThan')).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true when leftValue equals rightValue', () => {
      expect(adapter.check(10, 10, 'equals')).toBe(true);
    });

    it('should return false when leftValue does not equal rightValue', () => {
      expect(adapter.check(10, 5, 'equals')).toBe(false);
    });

    it('should return true when leftValue is in rightValue array', () => {
      expect(adapter.check(10, [5, 10, 15], 'equals')).toBe(true);
    });

    it('should return false when leftValue is not in rightValue array', () => {
      expect(adapter.check(20, [5, 10, 15], 'equals')).toBe(false);
    });
  });

  describe('greaterThan', () => {
    it('should return true when leftValue is greater than rightValue', () => {
      expect(adapter.check(10, 5, 'greaterThan')).toBe(true);
    });

    it('should return false when leftValue is not greater than rightValue', () => {
      expect(adapter.check(5, 10, 'greaterThan')).toBe(false);
    });

    it('should return true when leftValue is greater than any value in rightValue array', () => {
      expect(adapter.check(25, [10, 20, 30], 'greaterThan')).toBe(true);
    });

    it('should return false when leftValue is not greater than any value in rightValue array', () => {
      expect(adapter.check(5, [10, 20, 30], 'greaterThan')).toBe(false);
    });
  });

  describe('greaterThanOrEquals', () => {
    it('should return true when leftValue is greater than or equals rightValue', () => {
      expect(adapter.check(10, 10, 'greaterThanOrEquals')).toBe(true);
      expect(adapter.check(15, 10, 'greaterThanOrEquals')).toBe(true);
    });

    it('should return false when leftValue is not greater than or equals rightValue', () => {
      expect(adapter.check(5, 10, 'greaterThanOrEquals')).toBe(false);
    });

    it('should return true when leftValue is greater than or equals any value in rightValue array', () => {
      expect(adapter.check(20, [10, 20, 30], 'greaterThanOrEquals')).toBe(true);
    });

    it('should return false when leftValue is not greater than or equals any value in rightValue array', () => {
      expect(adapter.check(5, [10, 20, 30], 'greaterThanOrEquals')).toBe(false);
    });
  });

  describe('lessThanOrEquals', () => {
    it('should return true when leftValue is less than or equals rightValue', () => {
      expect(adapter.check(10, 10, 'lessThanOrEquals')).toBe(true);
      expect(adapter.check(5, 10, 'lessThanOrEquals')).toBe(true);
    });

    it('should return false when leftValue is not less than or equals rightValue', () => {
      expect(adapter.check(15, 10, 'lessThanOrEquals')).toBe(false);
    });

    it('should return true when leftValue is less than or equals any value in rightValue array', () => {
      expect(adapter.check(10, [10, 20, 30], 'lessThanOrEquals')).toBe(true);
    });

    it('should return false when leftValue is not less than or equals any value in rightValue array', () => {
      expect(adapter.check(35, [10, 20, 30], 'lessThanOrEquals')).toBe(false);
    });
  });

  describe('contains', () => {
    it('should return true when leftValue is in rightValue array', () => {
      expect(adapter.check(10, [5, 10, 15], 'contains')).toBe(true);
    });

    it('should return false when leftValue is not in rightValue array', () => {
      expect(adapter.check(20, [5, 10, 15], 'contains')).toBe(false);
    });

    it('should return false when rightValue is not an array', () => {
      expect(adapter.check(10, 10, 'contains')).toBe(false);
    });
  });

  describe('notContains', () => {
    it('should return true when leftValue is not in rightValue array', () => {
      expect(adapter.check(20, [5, 10, 15], 'notContains')).toBe(true);
    });

    it('should return false when leftValue is in rightValue array', () => {
      expect(adapter.check(10, [5, 10, 15], 'notContains')).toBe(false);
    });

    it('should return true when rightValue is not an array', () => {
      expect(adapter.check(10, 10, 'notContains')).toBe(true);
    });
  });

  describe('empty', () => {
    it('should return true when rightValue array is empty', () => {
      expect(adapter.check(10, [], 'empty')).toBe(true);
    });

    it('should return false when rightValue array is not empty', () => {
      expect(adapter.check(10, [5, 10, 15], 'empty')).toBe(false);
    });

    it('should return false when rightValue is not an array', () => {
      expect(adapter.check(10, 10, 'empty')).toBe(false);
    });
  });

  describe('notEmpty', () => {
    it('should return true when rightValue array is not empty', () => {
      expect(adapter.check(10, [5, 10, 15], 'notEmpty')).toBe(true);
    });

    it('should return false when rightValue array is empty', () => {
      expect(adapter.check(10, [], 'notEmpty')).toBe(false);
    });

    it('should return false when rightValue is not an array', () => {
      expect(adapter.check(10, 10, 'notEmpty')).toBe(false);
    });
  });
});
