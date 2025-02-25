import { ConditionGroup } from './condition.type';

// Example usage:
export const exampleCondition: ConditionGroup = {
  combinator: 'AND',
  conditions: [
    {
      combinator: 'OR',
      conditions: [
        { operator: 'contains', type: 'string', field: 'name', value: 'Alice' },
        { operator: 'contains', type: 'string', field: 'name', value: 'Bob' },
      ],
    },
    {
      combinator: 'AND',
      conditions: [
        { operator: 'greaterThan', type: 'number', field: 'age', value: 30 },
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
    {
      field: 'createdAt',
      type: 'date',
      operator: 'greaterThanOrEquals',
      value: new Date('2021-01-01'),
    },
  ],
};
export const moreComplexCondition: ConditionGroup = {
  combinator: 'AND',
  conditions: [
    {
      combinator: 'OR',
      conditions: [
        { operator: 'equals', type: 'number', field: 'isActive', value: true },
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
        { operator: 'endsWith', type: 'string', field: 'username', value: 'Z' },
      ],
    },
  ],
};
