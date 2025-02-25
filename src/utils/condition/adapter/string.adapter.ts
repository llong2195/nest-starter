import { ParseHelper } from '../../parse.helper';
import { IConditionAdapter } from './i.adapter';

export enum StringOperatorEnum {
  contains = 'contains',
  notContains = 'notContains',
  empty = 'empty',
  notEmpty = 'notEmpty',
  equals = 'equals',
  notEquals = 'notEquals',
  startsWith = 'startsWith',
  notStartsWith = 'notStartsWith',
  endsWith = 'endsWith',
  notEndsWith = 'notEndsWith',
  regex = 'regex',
  notRegex = 'notRegex',
}

export type StringOperator = `${StringOperatorEnum}`;

// export type StringOperator =
//   | 'contains'
//   | 'notContains'
//   | 'empty'
//   | 'notEmpty'
//   | 'equals'
//   | 'notEquals'
//   | 'startsWith'
//   | 'notStartsWith'
//   | 'endsWith'
//   | 'notEndsWith'
//   | 'regex'
//   | 'notRegex';

export class StringConditionAdapter implements IConditionAdapter {
  check(
    leftValue: string,
    rightValue: string | string[],
    operator: StringOperator,
  ): boolean {
    const ignoreCase = false;
    if (ignoreCase) {
      leftValue = this.toLowerCase(leftValue) as string;
      rightValue = this.toLowerCase(rightValue);
    }

    switch (operator) {
      case 'empty':
        return leftValue.length === 0;
      case 'notEmpty':
        return leftValue.length !== 0;
      case 'equals':
        return this.equals(leftValue, rightValue);
      case 'notEquals':
        return !this.equals(leftValue, rightValue);
      case 'contains':
        return this.contains(leftValue, rightValue);
      case 'notContains':
        return !this.contains(leftValue, rightValue);
      case 'startsWith':
        return this.startsWith(leftValue, rightValue);
      case 'notStartsWith':
        return !this.startsWith(leftValue, rightValue);
      case 'endsWith':
        return this.endsWith(leftValue, rightValue);
      case 'notEndsWith':
        return !this.endsWith(leftValue, rightValue);
      case 'regex':
        return this.regex(leftValue, rightValue);
      case 'notRegex':
        return !this.regex(leftValue, rightValue);
      default:
        throw new Error(`Unsupported operator: ${String(operator)}`);
    }
  }

  private toLowerCase(value: string | string[]): string | string[] {
    if (Array.isArray(value)) {
      return value.map((v) => v.toLowerCase());
    }
    return value.toLowerCase();
  }

  private equals(leftValue: string, rightValue: string | string[]): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.includes(leftValue);
    }
    return leftValue === rightValue;
  }

  private contains(leftValue: string, rightValue: string | string[]): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.some((rv) => leftValue.includes(rv));
    }
    return leftValue.includes(rightValue);
  }

  private startsWith(
    leftValue: string,
    rightValue: string | string[],
  ): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.some((rv) => leftValue.startsWith(rv));
    }
    return leftValue.startsWith(rightValue);
  }

  private endsWith(leftValue: string, rightValue: string | string[]): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.some((rv) => leftValue.endsWith(rv));
    }
    return leftValue.endsWith(rightValue);
  }

  private regex(leftValue: string, rightValue: string | string[]): boolean {
    if (Array.isArray(rightValue)) {
      return rightValue.some((rv) =>
        ParseHelper.parseRegexPattern(rv).test(leftValue),
      );
    }
    return ParseHelper.parseRegexPattern(rightValue).test(leftValue);
  }
}
