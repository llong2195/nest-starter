import { Operator } from '../condition.type';

export interface IConditionAdapter {
  check(leftValue: any, rightValue: any, operator: Operator): boolean;
}
