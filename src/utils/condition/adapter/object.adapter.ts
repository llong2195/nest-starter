import { isEqual } from 'lodash';

import { IConditionAdapter } from './i.adapter';

export enum ObjectOperatorEnum {
  equals = 'equals',
  notEquals = 'notEquals',
}

export type ObjectOperator = `${ObjectOperatorEnum}`;
// export type ObjectOperator = 'equals' | 'notEquals';

export class ObjectConditionAdapter implements IConditionAdapter {
  check(leftValue: any, rightValue: any, operator: ObjectOperator): boolean {
    switch (operator) {
      case 'equals':
        return isEqual(leftValue, rightValue);
      case 'notEquals':
        return !isEqual(leftValue, rightValue);
      default:
        throw new Error(`Unsupported operator for object: ${String(operator)}`);
    }
  }
}
