import { StringConditionAdapter, StringOperator } from './string.adapter';

describe('StringConditionAdapter', () => {
  let adapter: StringConditionAdapter;

  beforeEach(() => {
    adapter = new StringConditionAdapter();
  });

  describe('check', () => {
    const testCases: {
      leftValue: string;
      rightValue: string | string[];
      operator: StringOperator;
      expected: boolean;
    }[] = [
      {
        leftValue: 'hello',
        rightValue: 'he',
        operator: 'startsWith',
        expected: true,
      },
      {
        leftValue: 'hello',
        rightValue: 'lo',
        operator: 'startsWith',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: 'he',
        operator: 'notStartsWith',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: 'lo',
        operator: 'notStartsWith',
        expected: true,
      },
      {
        leftValue: 'hello',
        rightValue: 'lo',
        operator: 'endsWith',
        expected: true,
      },
      {
        leftValue: 'hello',
        rightValue: 'he',
        operator: 'endsWith',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: 'lo',
        operator: 'notEndsWith',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: 'he',
        operator: 'notEndsWith',
        expected: true,
      },
      {
        leftValue: 'hello',
        rightValue: 'ell',
        operator: 'contains',
        expected: true,
      },
      {
        leftValue: 'hello',
        rightValue: 'xyz',
        operator: 'contains',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: 'ell',
        operator: 'notContains',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: 'xyz',
        operator: 'notContains',
        expected: true,
      },
      {
        leftValue: 'hello',
        rightValue: '',
        operator: 'empty',
        expected: false,
      },
      { leftValue: '', rightValue: '', operator: 'empty', expected: true },
      {
        leftValue: 'hello',
        rightValue: '',
        operator: 'notEmpty',
        expected: true,
      },
      { leftValue: '', rightValue: '', operator: 'notEmpty', expected: false },
      {
        leftValue: 'hello',
        rightValue: 'hello',
        operator: 'equals',
        expected: true,
      },
      {
        leftValue: 'hello',
        rightValue: 'world',
        operator: 'equals',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: 'hello',
        operator: 'notEquals',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: 'world',
        operator: 'notEquals',
        expected: true,
      },
      {
        leftValue: 'hello',
        rightValue: '^h.*o$',
        operator: 'regex',
        expected: true,
      },
      {
        leftValue: 'hello',
        rightValue: '^w.*d$',
        operator: 'regex',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: '^h.*o$',
        operator: 'notRegex',
        expected: false,
      },
      {
        leftValue: 'hello',
        rightValue: '^w.*d$',
        operator: 'notRegex',
        expected: true,
      },
    ];

    testCases.forEach(({ leftValue, rightValue, operator, expected }) => {
      it(`should return ${expected} for ${operator} with leftValue: ${leftValue} and rightValue: ${String(rightValue)}`, () => {
        const result = adapter.check(leftValue, rightValue, operator);
        expect(result).toBe(expected);
      });
    });
  });
});
