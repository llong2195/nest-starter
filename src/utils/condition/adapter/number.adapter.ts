import { IConditionAdapter } from './i.adapter';

export enum NumberOperatorEnum {
  contains = 'contains',
  notContains = 'notContains',
  empty = 'empty',
  notEmpty = 'notEmpty',
  equals = 'equals',
  notEquals = 'notEquals',
  greaterThan = 'greaterThan',
  lessThan = 'lessThan',
  greaterThanOrEquals = 'greaterThanOrEquals',
  lessThanOrEquals = 'lessThanOrEquals',
}

export type NumberOperator = `${NumberOperatorEnum}`;

// export type NumberOperator =
//   | 'contains'
//   | 'notContains'
//   | 'empty'
//   | 'notEmpty'
//   | 'equals'
//   | 'notEquals'
//   | 'greaterThan'
//   | 'lessThan'
//   | 'greaterThanOrEquals'
//   | 'lessThanOrEquals';

export class NumberConditionAdapter implements IConditionAdapter {
  check(
    leftValue: number,
    rightValue: number | number[],
    operator: NumberOperator,
  ): boolean {
    switch (operator) {
      case 'equals':
        return this.equals(leftValue, rightValue);
      case 'notEquals':
        return !this.equals(leftValue, rightValue);
      case 'greaterThan':
        return this.greaterThan(leftValue, rightValue);
      case 'lessThan':
        return this.lessThan(leftValue, rightValue);
      case 'greaterThanOrEquals':
        return this.greaterThanOrEquals(leftValue, rightValue);
      case 'lessThanOrEquals':
        return this.lessThanOrEquals(leftValue, rightValue);
      case 'contains':
        return this.contains(leftValue, rightValue);
      case 'notContains':
        return this.notContains(leftValue, rightValue);
      case 'empty':
        return this.empty(leftValue, rightValue);
      case 'notEmpty':
        return this.notEmpty(leftValue, rightValue);
      default:
        throw new Error(`Unsupported operator for number: ${String(operator)}`);
    }
  }

  private equals(leftValue: number, rightValue: number | number[]): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.includes(leftValue);
    }
    return leftValue === rightValue;
  }

  private greaterThan(
    leftValue: number,
    rightValue: number | number[],
  ): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.some((value) => leftValue > value);
    }
    return leftValue > rightValue;
  }

  private lessThan(leftValue: number, rightValue: number | number[]): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.some((value) => leftValue < value);
    }
    return leftValue < rightValue;
  }

  private greaterThanOrEquals(
    leftValue: number,
    rightValue: number | number[],
  ): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.some((value) => leftValue >= value);
    }
    return leftValue >= rightValue;
  }

  private lessThanOrEquals(
    leftValue: number,
    rightValue: number | number[],
  ): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.some((value) => leftValue <= value);
    }
    return leftValue <= rightValue;
  }

  private contains(leftValue: number, rightValue: number | number[]): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.includes(leftValue);
    }
    return false;
  }

  private notContains(
    leftValue: number,
    rightValue: number | number[],
  ): boolean {
    if (Array.isArray(rightValue)) {
      return !rightValue.includes(leftValue);
    }
    return true;
  }

  private empty(leftValue: number, rightValue: number | number[]): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.length === 0;
    }
    return false;
  }

  private notEmpty(leftValue: number, rightValue: number | number[]): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.length > 0;
    }
    return false;
  }
}
