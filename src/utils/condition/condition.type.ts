import { DateTime } from 'luxon';

import {
  DateTimeOperator,
  DateTimeOperatorEnum,
} from './adapter/datetime.adapter';
import { NumberOperator, NumberOperatorEnum } from './adapter/number.adapter';
import { ObjectOperator, ObjectOperatorEnum } from './adapter/object.adapter';
import { StringOperator, StringOperatorEnum } from './adapter/string.adapter';

export enum CombinatorEnum {
  AND = 'AND',
  OR = 'OR',
}

export type Combinator = `${CombinatorEnum}`;
// export type Combinator = 'AND' | 'OR';

export enum SupportedTypeEnum {
  Number = 'number',
  String = 'string',
  Date = 'date',
  Object = 'object',
}

export type SupportedType = `${SupportedTypeEnum}`;
// export type SupportedType = 'number' | 'string' | 'date' | 'object';

export const CombinedEnum = {
  ...CombinatorEnum,
} as const;

export const OperatorEnum = {
  exists: 'exists',
  notExists: 'notExists',
  ...DateTimeOperatorEnum,
  ...StringOperatorEnum,
  ...NumberOperatorEnum,
  ...ObjectOperatorEnum,
};

export type Operator =
  | 'exists'
  | 'notExists'
  | DateTimeOperator
  | StringOperator
  | NumberOperator
  | ObjectOperator;

export type ConditionValue =
  | (boolean | boolean[])
  | (string | string[])
  | (number | number[])
  | (Date | Date[])
  | (DateTime | DateTime[])
  | object
  | null;

export type Condition = {
  operator: Operator;
  type: SupportedType;
  field: string;
  /**
   * right side value
   */
  value: ConditionValue;
};

export type ConditionGroup = {
  combinator: Combinator;
  conditions: (Condition | ConditionGroup)[];
};
