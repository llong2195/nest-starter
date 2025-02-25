import { DateTime } from 'luxon';

import { IConditionAdapter } from './i.adapter';

export enum DateTimeOperatorEnum {
  equals = 'equals',
  notEquals = 'notEquals',
  greaterThan = 'greaterThan',
  lessThan = 'lessThan',
  greaterThanOrEquals = 'greaterThanOrEquals',
  lessThanOrEquals = 'lessThanOrEquals',
}

export type DateTimeOperator = `${DateTimeOperatorEnum}`;
// export type DateTimeOperator =
//   | 'equals'
//   | 'notEquals'
//   | 'after'
//   | 'before'
//   | 'afterOrEquals'
//   | 'beforeOrEquals';

export class DateConditionAdapter implements IConditionAdapter {
  check(
    leftValue: DateTime,
    rightValue: DateTime,
    operator: DateTimeOperator,
  ): boolean {
    switch (operator) {
      case 'equals':
        return leftValue.toMillis() === rightValue.toMillis();
      case 'notEquals':
        return leftValue.toMillis() !== rightValue.toMillis();
      case 'greaterThan':
        return leftValue.toMillis() > rightValue.toMillis();
      case 'lessThan':
        return leftValue.toMillis() < rightValue.toMillis();
      case 'greaterThanOrEquals':
        return leftValue.toMillis() >= rightValue.toMillis();
      case 'lessThanOrEquals':
        return leftValue.toMillis() <= rightValue.toMillis();
      default:
        throw new Error(`Unsupported operator for date: ${String(operator)}`);
    }
  }
}
