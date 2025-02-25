import { ConditionEvaluator } from './condition';
import { Condition, ConditionGroup } from './condition.type';

describe('ConditionEvaluator', () => {
  describe('evaluateCondition', () => {
    it('should return true if condition is null', () => {
      expect(ConditionEvaluator.evaluateCondition(null as any, {})).toBe(true);
    });

    it('should throw an error for unsupported type', () => {
      const condition: Condition = {
        field: 'test',
        value: 'value',
        operator: 'equals',
        type: 'unsupported' as any,
      };
      expect(() => ConditionEvaluator.evaluateCondition(condition, {})).toThrow(
        'Unsupported type: unsupported',
      );
    });

    it('should return false if data is null', () => {
      const condition: Condition = {
        field: 'test',
        value: 'value',
        operator: 'equals',
        type: 'string',
      };
      expect(ConditionEvaluator.evaluateCondition(condition, null as any)).toBe(
        false,
      );
    });

    it('should evaluate "exists" operator correctly', () => {
      const condition: Condition = {
        field: 'test',
        value: null,
        operator: 'exists',
        type: 'string',
      };
      expect(
        ConditionEvaluator.evaluateCondition(condition, { test: 'value' }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluateCondition(condition, { test: null }),
      ).toBe(false);
    });

    it('should evaluate "notExists" operator correctly', () => {
      const condition: Condition = {
        field: 'test',
        value: null,
        operator: 'notExists',
        type: 'string',
      };
      expect(
        ConditionEvaluator.evaluateCondition(condition, { test: 'value' }),
      ).toBe(false);
      expect(
        ConditionEvaluator.evaluateCondition(condition, { test: null }),
      ).toBe(true);
    });

    it('should evaluate condition using adapter', () => {
      const condition: Condition = {
        field: 'test',
        value: 'value',
        operator: 'equals',
        type: 'string',
      };
      expect(
        ConditionEvaluator.evaluateCondition(condition, { test: 'value' }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluateCondition(condition, { test: 'different' }),
      ).toBe(false);
    });

    it('should throw an error if value cannot be parsed', () => {
      const condition: Condition = {
        field: 'test',
        value: 'invalid',
        operator: 'equals',
        type: 'number',
      };
      expect(() =>
        ConditionEvaluator.evaluateCondition(condition, { test: 'invalid' }),
      ).toThrow('Value is not a valid number');
    });

    it('should evaluate "greaterThan" operator correctly', () => {
      const condition: Condition = {
        field: 'test',
        value: 10,
        operator: 'greaterThan',
        type: 'number',
      };
      expect(
        ConditionEvaluator.evaluateCondition(condition, { test: 15 }),
      ).toBe(true);
      expect(ConditionEvaluator.evaluateCondition(condition, { test: 5 })).toBe(
        false,
      );
    });

    it('should evaluate "lessThan" operator correctly', () => {
      const condition: Condition = {
        field: 'test',
        value: 10,
        operator: 'lessThan',
        type: 'number',
      };
      expect(ConditionEvaluator.evaluateCondition(condition, { test: 5 })).toBe(
        true,
      );
      expect(
        ConditionEvaluator.evaluateCondition(condition, { test: 15 }),
      ).toBe(false);
    });
  });

  describe('evaluateConditionGroup', () => {
    it('should evaluate AND combinator correctly', () => {
      const conditionGroup: ConditionGroup = {
        combinator: 'AND',
        conditions: [
          {
            field: 'test1',
            value: 'value1',
            operator: 'equals',
            type: 'string',
          },
          {
            field: 'test2',
            value: 'value2',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test1: 'value1',
          test2: 'value2',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test1: 'value1',
          test2: 'different',
        }),
      ).toBe(false);
    });

    it('should evaluate OR combinator correctly', () => {
      const conditionGroup: ConditionGroup = {
        combinator: 'OR',
        conditions: [
          {
            field: 'test1',
            value: 'value1',
            operator: 'equals',
            type: 'string',
          },
          {
            field: 'test2',
            value: 'value2',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test1: 'value1',
          test2: 'different',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test1: 'different',
          test2: 'value2',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test1: 'different',
          test2: 'different',
        }),
      ).toBe(false);
    });

    it('should throw an error for unsupported combinator', () => {
      const conditionGroup: ConditionGroup = {
        combinator: 'UNSUPPORTED' as any,
        conditions: [],
      };
      expect(() =>
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {}),
      ).toThrow('Unsupported operator group: UNSUPPORTED');
    });

    it('should evaluate nested condition groups correctly', () => {
      const conditionGroup: ConditionGroup = {
        combinator: 'AND',
        conditions: [
          {
            combinator: 'OR',
            conditions: [
              {
                field: 'test1',
                value: 'value1',
                operator: 'equals',
                type: 'string',
              },
              {
                field: 'test2',
                value: 'value2',
                operator: 'equals',
                type: 'string',
              },
            ],
          },
          {
            field: 'test3',
            value: 'value3',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test1: 'value1',
          test3: 'value3',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test2: 'value2',
          test3: 'value3',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test1: 'value1',
          test3: 'different',
        }),
      ).toBe(false);
    });

    it('should evaluate nested condition groups with different combinators correctly', () => {
      const conditionGroup: ConditionGroup = {
        combinator: 'OR',
        conditions: [
          {
            combinator: 'AND',
            conditions: [
              {
                field: 'test1',
                value: 'value1',
                operator: 'equals',
                type: 'string',
              },
              {
                field: 'test2',
                value: 'value2',
                operator: 'equals',
                type: 'string',
              },
            ],
          },
          {
            field: 'test3',
            value: 'value3',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test1: 'value1',
          test2: 'value2',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test3: 'value3',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluateConditionGroup(conditionGroup, {
          test1: 'different',
          test2: 'different',
          test3: 'different',
        }),
      ).toBe(false);
    });
  });

  describe('ConditionEvaluator with example conditions', () => {
    const exampleCondition: ConditionGroup = {
      combinator: 'OR',
      conditions: [
        {
          combinator: 'AND',
          conditions: [
            {
              operator: 'greaterThanOrEquals',
              type: 'number',
              field: 'A',
              value: 1,
            },
            {
              operator: 'greaterThanOrEquals',
              type: 'number',
              field: 'B',
              value: 2,
            },
            {
              combinator: 'OR',
              conditions: [
                {
                  operator: 'greaterThanOrEquals',
                  type: 'number',
                  field: 'C',
                  value: 3,
                },
                {
                  operator: 'greaterThanOrEquals',
                  type: 'number',
                  field: 'D',
                  value: 4,
                },
              ],
            },
            {
              combinator: 'OR',
              conditions: [
                {
                  operator: 'greaterThanOrEquals',
                  type: 'number',
                  field: 'E',
                  value: 5,
                },
                {
                  operator: 'greaterThanOrEquals',
                  type: 'number',
                  field: 'F',
                  value: 6,
                },
              ],
            },
          ],
        },
        {
          combinator: 'AND',
          conditions: [
            {
              operator: 'greaterThanOrEquals',
              type: 'number',
              field: 'G',
              value: 7,
            },
            {
              combinator: 'OR',
              conditions: [
                {
                  operator: 'greaterThanOrEquals',
                  type: 'number',
                  field: 'H',
                  value: 8,
                },
                {
                  combinator: 'AND',
                  conditions: [
                    {
                      operator: 'greaterThanOrEquals',
                      type: 'number',
                      field: 'I',
                      value: 9,
                    },
                    {
                      operator: 'greaterThanOrEquals',
                      type: 'number',
                      field: 'J',
                      value: 10,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const complexCondition: ConditionGroup = {
      combinator: 'AND',
      conditions: [
        {
          combinator: 'OR',
          conditions: [
            {
              operator: 'contains',
              type: 'string',
              field: 'name',
              value: 'Alice',
            },
            {
              operator: 'contains',
              type: 'string',
              field: 'name',
              value: 'Bob',
            },
          ],
        },
        {
          combinator: 'AND',
          conditions: [
            {
              operator: 'greaterThan',
              type: 'number',
              field: 'age',
              value: 30,
            },
            { operator: 'lessThan', type: 'number', field: 'age', value: 50 },
          ],
        },
        {
          combinator: 'OR',
          conditions: [
            {
              combinator: 'AND',
              conditions: [
                {
                  operator: 'contains',
                  type: 'string',
                  field: 'address',
                  value: 'Street',
                },
                {
                  operator: 'contains',
                  type: 'string',
                  field: 'address',
                  value: '%Avenue%',
                },
              ],
            },
            {
              combinator: 'AND',
              conditions: [
                {
                  operator: 'contains',
                  type: 'string',
                  field: 'status',
                  value: ['active', 'pending'],
                },
                {
                  operator: 'notEmpty',
                  type: 'string',
                  field: 'email',
                  value: null,
                },
              ],
            },
          ],
        },
      ],
    };

    const moreComplexCondition: ConditionGroup = {
      combinator: 'AND',
      conditions: [
        {
          combinator: 'OR',
          conditions: [
            {
              operator: 'equals',
              type: 'number',
              field: 'isActive',
              value: true,
            },
            {
              operator: 'equals',
              type: 'number',
              field: 'isVerified',
              value: true,
            },
          ],
        },
        {
          combinator: 'AND',
          conditions: [
            {
              operator: 'greaterThanOrEquals',
              type: 'number',
              field: 'score',
              value: 80,
            },
            {
              operator: 'lessThanOrEquals',
              type: 'number',
              field: 'score',
              value: 100,
            },
          ],
        },
        {
          combinator: 'OR',
          conditions: [
            {
              combinator: 'AND',
              conditions: [
                {
                  operator: 'contains',
                  type: 'string',
                  field: 'role',
                  value: 'admin',
                },
                {
                  operator: 'contains',
                  type: 'string',
                  field: 'department',
                  value: 'IT',
                },
              ],
            },
            {
              combinator: 'AND',
              conditions: [
                {
                  operator: 'contains',
                  type: 'string',
                  field: 'role',
                  value: 'user',
                },
                {
                  operator: 'contains',
                  type: 'string',
                  field: 'department',
                  value: 'HR',
                },
              ],
            },
          ],
        },
        {
          combinator: 'AND',
          conditions: [
            {
              operator: 'startsWith',
              type: 'string',
              field: 'username',
              value: 'A',
            },
            {
              operator: 'endsWith',
              type: 'string',
              field: 'username',
              value: 'Z',
            },
          ],
        },
      ],
    };

    it('should evaluate exampleCondition correctly', () => {
      const data = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        E: 5,
        F: 6,
        G: 7,
        H: 8,
        I: 9,
        J: 10,
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(exampleCondition, data),
      ).toBe(true);
    });

    it('should evaluate complexCondition correctly', () => {
      const data = {
        name: 'Alice',
        age: 35,
        address: '123 Street',
        status: 'active',
        email: 'alice@example.com',
        isActive: true,
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(complexCondition, data),
      ).toBe(true);
    });

    it('should evaluate moreComplexCondition correctly', () => {
      const data = {
        isActive: true,
        isVerified: true,
        score: 90,
        role: 'admin',
        department: 'IT',
        username: 'AUserZ',
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(moreComplexCondition, data),
      ).toBe(true);
    });

    // Additional test cases
    it('should return false for exampleCondition with different data', () => {
      const data = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
        E: 4,
        F: 5,
        G: 6,
        H: 7,
        I: 8,
        J: 9,
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(exampleCondition, data),
      ).toBe(false);
    });

    it('should return false for complexCondition with edge case data', () => {
      const data = {
        name: 'Charlie',
        age: 25,
        address: '456 Road',
        status: 'inactive',
        email: '',
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(complexCondition, data),
      ).toBe(false);
    });

    it('should return false for moreComplexCondition with different data', () => {
      const data = {
        isActive: false,
        isVerified: false,
        score: 70,
        role: 'guest',
        department: 'Finance',
        username: 'BUserY',
      };
      expect(
        ConditionEvaluator.evaluateConditionGroup(moreComplexCondition, data),
      ).toBe(false);
    });
  });

  describe('evaluate', () => {
    it('should evaluate a single condition correctly', () => {
      const condition: Condition = {
        field: 'test',
        value: 'value',
        operator: 'equals',
        type: 'string',
      };
      expect(ConditionEvaluator.evaluate(condition, { test: 'value' })).toBe(
        true,
      );
      expect(
        ConditionEvaluator.evaluate(condition, { test: 'different' }),
      ).toBe(false);
    });

    it('should evaluate a condition group correctly', () => {
      const conditionGroup: ConditionGroup = {
        combinator: 'AND',
        conditions: [
          {
            field: 'test1',
            value: 'value1',
            operator: 'equals',
            type: 'string',
          },
          {
            field: 'test2',
            value: 'value2',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(
        ConditionEvaluator.evaluate(conditionGroup, {
          test1: 'value1',
          test2: 'value2',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluate(conditionGroup, {
          test1: 'value1',
          test2: 'different',
        }),
      ).toBe(false);
    });

    it('should throw an error for invalid condition', () => {
      const invalidCondition = {} as Condition;
      expect(() => ConditionEvaluator.evaluate(invalidCondition, {})).toThrow(
        'Invalid condition',
      );
    });

    it('should evaluate nested condition groups correctly', () => {
      const conditionGroup: ConditionGroup = {
        combinator: 'AND',
        conditions: [
          {
            combinator: 'OR',
            conditions: [
              {
                field: 'test1',
                value: 'value1',
                operator: 'equals',
                type: 'string',
              },
              {
                field: 'test2',
                value: 'value2',
                operator: 'equals',
                type: 'string',
              },
            ],
          },
          {
            field: 'test3',
            value: 'value3',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(
        ConditionEvaluator.evaluate(conditionGroup, {
          test1: 'value1',
          test3: 'value3',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluate(conditionGroup, {
          test2: 'value2',
          test3: 'value3',
        }),
      ).toBe(true);
      expect(
        ConditionEvaluator.evaluate(conditionGroup, {
          test1: 'value1',
          test3: 'different',
        }),
      ).toBe(false);
    });
  });

  describe('validateCondition', () => {
    it('should return true for a valid Condition', () => {
      const condition: Condition = {
        field: 'test',
        value: 'value',
        operator: 'equals',
        type: 'string',
      };
      expect(ConditionEvaluator.validateCondition(condition)).toBe(true);
    });

    it('should return true for a valid ConditionGroup', () => {
      const conditionGroup: ConditionGroup = {
        combinator: 'AND',
        conditions: [
          {
            field: 'test1',
            value: 'value1',
            operator: 'equals',
            type: 'string',
          },
          {
            field: 'test2',
            value: 'value2',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(ConditionEvaluator.validateCondition(conditionGroup)).toBe(true);
    });

    it('should return false for an invalid Condition', () => {
      const invalidCondition = {
        field: 'test',
        value: 'value',
        operator: 'invalidOperator',
        type: 'string',
      };

      expect(ConditionEvaluator.validateCondition(invalidCondition)).toBe(
        false,
      );
    });

    it('should return false for an invalid ConditionGroup', () => {
      const invalidConditionGroup = {
        combinator: 'INVALID',
        conditions: [
          {
            field: 'test1',
            value: 'value1',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(ConditionEvaluator.validateCondition(invalidConditionGroup)).toBe(
        false,
      );
    });

    it('should return false for a completely invalid object', () => {
      const invalidObject = {
        someField: 'someValue',
      };
      expect(ConditionEvaluator.validateCondition(invalidObject)).toBe(false);
    });
  });

  describe('isConditionGroup', () => {
    it('should return true for a valid ConditionGroup', () => {
      const conditionGroup: ConditionGroup = {
        combinator: 'AND',
        conditions: [
          {
            field: 'test1',
            value: 'value1',
            operator: 'equals',
            type: 'string',
          },
          {
            field: 'test2',
            value: 'value2',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(ConditionEvaluator.isConditionGroup(conditionGroup)).toBe(true);
    });

    it('should return false for an object without combinator', () => {
      const invalidGroup = {
        conditions: [
          {
            field: 'test1',
            value: 'value1',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(ConditionEvaluator.isConditionGroup(invalidGroup)).toBe(false);
    });

    it('should return false for an object with invalid combinator', () => {
      const invalidGroup = {
        combinator: 'INVALID',
        conditions: [
          {
            field: 'test1',
            value: 'value1',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(ConditionEvaluator.isConditionGroup(invalidGroup)).toBe(false);
    });

    it('should return false for an object without conditions', () => {
      const invalidGroup = {
        combinator: 'AND',
      };
      expect(ConditionEvaluator.isConditionGroup(invalidGroup)).toBe(false);
    });

    it('should return false for an object with non-array conditions', () => {
      const invalidGroup = {
        combinator: 'AND',
        conditions: {},
      };
      expect(ConditionEvaluator.isConditionGroup(invalidGroup)).toBe(false);
    });

    it('should return false for an object with invalid conditions', () => {
      const invalidGroup = {
        combinator: 'AND',
        conditions: [
          {
            field: 'test1',
            value: 'value1',
            operator: 'invalidOperator',
            type: 'string',
          },
        ],
      };
      expect(ConditionEvaluator.isConditionGroup(invalidGroup)).toBe(false);
    });

    it('should return true for nested valid ConditionGroups', () => {
      const nestedGroup: ConditionGroup = {
        combinator: 'AND',
        conditions: [
          {
            combinator: 'OR',
            conditions: [
              {
                field: 'test1',
                value: 'value1',
                operator: 'equals',
                type: 'string',
              },
              {
                field: 'test2',
                value: 'value2',
                operator: 'equals',
                type: 'string',
              },
            ],
          },
          {
            field: 'test3',
            value: 'value3',
            operator: 'equals',
            type: 'string',
          },
        ],
      };
      expect(ConditionEvaluator.isConditionGroup(nestedGroup)).toBe(true);
    });
  });

  describe('isCondition', () => {
    it('should return true for a valid Condition', () => {
      const condition: Condition = {
        field: 'test',
        value: 'value',
        operator: 'equals',
        type: 'string',
      };
      expect(ConditionEvaluator.isCondition(condition)).toBe(true);
    });

    it('should return false for an object without operator', () => {
      const invalidCondition = {
        field: 'test',
        value: 'value',
        type: 'string',
      };
      expect(ConditionEvaluator.isCondition(invalidCondition)).toBe(false);
    });

    it('should return false for an object with invalid operator', () => {
      const invalidCondition = {
        field: 'test',
        value: 'value',
        operator: 'invalidOperator',
        type: 'string',
      };
      expect(ConditionEvaluator.isCondition(invalidCondition)).toBe(false);
    });

    it('should return false for an object without type', () => {
      const invalidCondition = {
        field: 'test',
        value: 'value',
        operator: 'equals',
      };
      expect(ConditionEvaluator.isCondition(invalidCondition)).toBe(false);
    });

    it('should return false for an object with unsupported type', () => {
      const invalidCondition = {
        field: 'test',
        value: 'value',
        operator: 'equals',
        type: 'unsupported',
      };
      expect(ConditionEvaluator.isCondition(invalidCondition)).toBe(false);
    });

    it('should return false for an object without field', () => {
      const invalidCondition = {
        value: 'value',
        operator: 'equals',
        type: 'string',
      };
      expect(ConditionEvaluator.isCondition(invalidCondition)).toBe(false);
    });

    it('should return false for an object with non-string field', () => {
      const invalidCondition = {
        field: 123,
        value: 'value',
        operator: 'equals',
        type: 'string',
      };
      expect(ConditionEvaluator.isCondition(invalidCondition)).toBe(false);
    });

    it('should return false for an object without value', () => {
      const invalidCondition = {
        field: 'test',
        operator: 'equals',
        type: 'string',
      };
      expect(ConditionEvaluator.isCondition(invalidCondition)).toBe(false);
    });

    it('should return false for an object with invalid value', () => {
      const invalidCondition = {
        field: 'test',
        value: () => {
          //
        },
        operator: 'equals',
        type: 'string',
      };
      expect(ConditionEvaluator.isCondition(invalidCondition)).toBe(false);
    });
  });

  describe('isSupportedType', () => {
    it('should return true for supported types', () => {
      expect(ConditionEvaluator.isSupportedType('number')).toBe(true);
      expect(ConditionEvaluator.isSupportedType('string')).toBe(true);
      expect(ConditionEvaluator.isSupportedType('date')).toBe(true);
      expect(ConditionEvaluator.isSupportedType('object')).toBe(true);
    });

    it('should return false for unsupported types', () => {
      expect(ConditionEvaluator.isSupportedType('boolean')).toBe(false);
      expect(ConditionEvaluator.isSupportedType('array')).toBe(false);
      expect(ConditionEvaluator.isSupportedType('unsupported')).toBe(false);
    });
  });

  describe('isOperator', () => {
    it('should return true for supported operators', () => {
      const supportedOperators = [
        'exists',
        'notExists',
        'equals',
        'notEquals',
        'contains',
        'notContains',
        'empty',
        'notEmpty',
        'startsWith',
        'notStartsWith',
        'endsWith',
        'notEndsWith',
        'regex',
        'notRegex',
        'greaterThan',
        'lessThan',
        'greaterThanOrEquals',
        'lessThanOrEquals',
      ];
      supportedOperators.forEach((operator) => {
        expect(ConditionEvaluator.isOperator(operator)).toBe(true);
      });
    });

    it('should return false for unsupported operators', () => {
      const unsupportedOperators = [
        'invalidOperator',
        'unknown',
        'unsupported',
      ];
      unsupportedOperators.forEach((operator) => {
        expect(ConditionEvaluator.isOperator(operator)).toBe(false);
      });
    });
  });

  describe('isConditionValue', () => {
    it('should return true for boolean values', () => {
      expect(ConditionEvaluator.isConditionValue(true)).toBe(true);
      expect(ConditionEvaluator.isConditionValue(false)).toBe(true);
    });

    it('should return true for string values', () => {
      expect(ConditionEvaluator.isConditionValue('test')).toBe(true);
      expect(ConditionEvaluator.isConditionValue('')).toBe(true);
    });

    it('should return true for number values', () => {
      expect(ConditionEvaluator.isConditionValue(123)).toBe(true);
      expect(ConditionEvaluator.isConditionValue(0)).toBe(true);
      expect(ConditionEvaluator.isConditionValue(-123)).toBe(true);
    });

    it('should return true for Date values', () => {
      expect(ConditionEvaluator.isConditionValue(new Date())).toBe(true);
    });

    it('should return true for null value', () => {
      expect(ConditionEvaluator.isConditionValue(null)).toBe(true);
    });

    it('should return true for arrays of valid ConditionValues', () => {
      expect(
        ConditionEvaluator.isConditionValue([
          true,
          'test',
          123,
          new Date(),
          null,
        ]),
      ).toBe(true);
    });

    it('should return true for objects', () => {
      expect(ConditionEvaluator.isConditionValue({})).toBe(true);
      expect(ConditionEvaluator.isConditionValue({ key: 'value' })).toBe(true);
    });

    it('should return false for functions', () => {
      expect(
        ConditionEvaluator.isConditionValue(() => {
          //
        }),
      ).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(ConditionEvaluator.isConditionValue(undefined)).toBe(false);
    });
  });
});
