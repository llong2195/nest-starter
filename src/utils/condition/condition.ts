import { isProd } from '../util';
import { DateConditionAdapter } from './adapter/datetime.adapter';
import { IConditionAdapter } from './adapter/i.adapter';
import { NumberConditionAdapter } from './adapter/number.adapter';
import { ObjectConditionAdapter } from './adapter/object.adapter';
import { StringConditionAdapter } from './adapter/string.adapter';
import { DebugVisualizer } from './condition.debug-visualize';
import { ConditionHelper } from './condition.helper';
import {
  Condition,
  ConditionGroup,
  ConditionValue,
  Operator,
  OperatorEnum,
  SupportedType,
  SupportedTypeEnum,
} from './condition.type';

/**
 * Returns the visualizer object for debugging purposes.
 * @description
 * Steps:
 * 1. Set breakpoints at debugger statements : `DebugVisualizer.addNode(...)`
 * 2. Open Debug Visualizer panel : `Ctrl+Shift+P -> Debug Visualizer: Open`
 * 3. Watch tree build as evaluation progresses : input `$visualizer()`, Extractor: `As Is`, Visualizer: `vis.js`
 *
 * @link https://marketplace.visualstudio.com/items?itemName=hediet.debug-visualizer
 */
const $visualizer = () => DebugVisualizer.getViz();

export class ConditionEvaluator {
  private static readonly adapters: {
    [key in SupportedType]: IConditionAdapter;
  } = {
    number: new NumberConditionAdapter(),
    string: new StringConditionAdapter(),
    date: new DateConditionAdapter(),
    object: new ObjectConditionAdapter(),
  };

  static readonly supportedTypes = Object.values(SupportedTypeEnum);

  static readonly supportedOperators = Object.values(OperatorEnum);

  /**
   * Evaluates a given condition or condition group against the provided data.
   *
   * @param condition - The condition or condition group to evaluate.
   * @param data - The data object to evaluate the condition against.
   * @returns A boolean indicating whether the condition is met.
   * @throws Will throw an error if the provided condition is neither a Condition nor a ConditionGroup.
   */
  static evaluate(
    condition: Condition | ConditionGroup,
    data: { [key: string]: any },
  ): boolean {
    if (!isProd()) {
      DebugVisualizer.reset();
      $visualizer();
    }

    if (this.isCondition(condition)) {
      return this.evaluateCondition(condition, data);
    } else if (this.isConditionGroup(condition)) {
      return this.evaluateConditionGroup(condition, data);
    } else {
      throw new Error('Invalid condition');
    }
  }

  /**
   * Evaluates a condition against provided data.
   *
   * @param condition - The condition to evaluate, which includes the field, value, operator, and type.
   * @param data - The data object to evaluate the condition against.
   * @param parentId - The parent node ID for visualization purposes.
   * @returns `true` if the condition is met, `false` otherwise.
   * @throws Will throw an error if the condition type is unsupported or if value parsing fails.
   */
  static evaluateCondition(
    condition: Condition,
    data: { [key: string]: any },
    parentId?: string,
  ): boolean {
    if (!condition) {
      return true;
    }

    const { field, value: _rightValue, operator, type } = condition;

    const adapter = this.adapters[type];
    if (!adapter) {
      throw new Error(`Unsupported type: ${type}`);
    }
    if (!data || !data[field]) {
      return false;
    }

    let rightValue = _rightValue;
    let leftValue = data[field] as unknown;
    const rTryToParse = ConditionHelper.tryToParseValue(_rightValue, type);
    if (!rTryToParse.valid) {
      throw new Error(rTryToParse.errorMessage);
    }
    rightValue = rTryToParse.newValue as ConditionValue;

    const lTryToParse = ConditionHelper.tryToParseValue(leftValue, type);
    if (!lTryToParse.valid) {
      throw new Error(lTryToParse.errorMessage);
      // return false;
    }
    leftValue = lTryToParse.newValue;

    const exists =
      leftValue !== undefined && leftValue !== null && !Number.isNaN(leftValue);
    if (operator === 'exists') {
      return exists;
    } else if (operator === 'notExists') {
      return !exists;
    }
    const result = adapter.check(leftValue, rightValue, operator);
    // Update node with result
    if (!isProd()) {
      const nodeId = DebugVisualizer.getNodeId();

      // Start evaluation visualization
      DebugVisualizer.addNode(
        {
          id: nodeId,
          label: `Evaluating: ${condition.field}`,
          shape: 'box',
          color: '#1E90FF',
        },
        parentId,
      );
      DebugVisualizer.addNode(
        {
          id: nodeId,
          label: `${condition.field} ${condition.operator} ${JSON.stringify(condition.value)}`,
          shape: 'box',
          color: result ? '#90EE90' : '#FFB6C1',
        },
        parentId,
      );
    }
    return result;
  }

  /**
   * Evaluates a group of conditions based on the specified combinator ('AND' or 'OR').
   *
   * @param conditionGroup - The group of conditions to evaluate. It contains a combinator and an array of conditions.
   * @param data - The data object against which the conditions are evaluated.
   * @param parentId - The parent node ID for visualization purposes.
   * @returns A boolean indicating whether the condition group evaluates to true or false.
   * @throws Will throw an error if the combinator is not 'AND' or 'OR'.
   */
  static evaluateConditionGroup(
    conditionGroup: ConditionGroup,
    data: object,
    parentId?: string,
  ): boolean {
    // eslint-disable-next-line no-useless-catch
    try {
      // validate condition
      if (!conditionGroup) {
        return true;
      }

      // Debug visualization
      let nodeId: string | undefined = undefined;

      if (!isProd()) {
        nodeId = DebugVisualizer.getNodeId();
        // Start group evaluation
        DebugVisualizer.addNode(
          {
            id: nodeId,
            label: `Group (${conditionGroup.combinator})`,
            shape: 'box',
            color: '#1E90FF',
          },
          parentId,
        );
      }

      let result = false;

      const { combinator, conditions } = conditionGroup;
      if (combinator === 'AND') {
        // console.debug('Evaluating AND condition group:', conditionGroup);
        result = conditions.every((condition, index) => {
          // console.debug(
          //   `Evaluating condition ${index + 1} of ${conditions.length} in AND group`,
          // );
          const conditionResult =
            'operator' in condition
              ? this.evaluateCondition(condition, data, nodeId)
              : this.evaluateConditionGroup(condition, data, nodeId);
          // console.debug('Condition:', condition, 'Result:', conditionResult);
          return conditionResult;
        });
        // console.debug('AND condition group result:', result);
        // return result;
      } else if (combinator === 'OR') {
        // console.debug('Evaluating OR condition group:', conditionGroup);
        result = conditions.some((condition, index) => {
          // console.debug(
          //   `Evaluating condition ${index + 1} of ${conditions.length} in OR group`,
          // );
          const conditionResult =
            'operator' in condition
              ? this.evaluateCondition(condition, data, nodeId)
              : this.evaluateConditionGroup(condition, data, nodeId);
          // console.debug('Condition:', condition, 'Result:', conditionResult);
          return conditionResult;
        });
        // console.debug('OR condition group result:', result);
        // return result;
      } else {
        throw new Error(`Unsupported operator group: ${String(combinator)}`);
      }

      if (!isProd()) {
        // Update group node with final result
        DebugVisualizer.addNode(
          {
            id: nodeId || '',
            label: `Group (${conditionGroup.combinator})`,
            shape: 'box',
            color: result ? '#90EE90' : '#FFB6C1',
          },
          parentId,
        );
      }
      return result;
    } catch (error) {
      // console.error(error);
      // return false;
      throw error;
    }
  }

  /**
   * Validates whether the provided condition is a valid condition or condition group.
   *
   * @param condition - The condition object to validate.
   * @returns `true` if the condition is valid, otherwise `false`.
   */
  static validateCondition(condition: object): boolean {
    return (
      Object.keys(condition).length === 0 ||
      this.isCondition(condition) ||
      this.isConditionGroup(condition as Record<string, unknown>)
    );
  }

  /**
   * Checks if the provided group is a ConditionGroup.
   *
   * A ConditionGroup is an object that contains a combinator ('AND' or 'OR')
   * and an array of conditions. Each condition can either be a single condition
   * or another ConditionGroup.
   *
   * @param group - The group to check.
   * @returns True if the group is a ConditionGroup, false otherwise.
   */
  static isConditionGroup(
    group: Record<string, unknown>,
  ): group is ConditionGroup {
    return (
      typeof group === 'object' &&
      'combinator' in group &&
      ['AND', 'OR'].includes(group.combinator as string) &&
      'conditions' in group &&
      Array.isArray(group.conditions) &&
      group.conditions.every(
        (condition: { [key: string]: any }) =>
          this.isCondition(condition) ||
          this.isConditionGroup(condition as Record<string, unknown>),
      )
    );
  }

  /**
   * Determines if the provided value is a valid Condition object.
   *
   * @param condition - The value to check.
   * @returns True if the value is a Condition object, otherwise false.
   */
  static isCondition(condition: {
    [key: string]: any;
  }): condition is Condition {
    return (
      typeof condition === 'object' &&
      'operator' in condition &&
      this.isOperator(condition.operator as string) &&
      'type' in condition &&
      this.isSupportedType(condition.type as string) &&
      'field' in condition &&
      typeof condition.field === 'string' &&
      'value' in condition &&
      this.isConditionValue(condition.value)
    );
  }

  /**
   * Checks if the provided type is a supported type.
   *
   * @param type - The type to check.
   * @returns A boolean indicating whether the type is supported.
   */
  static isSupportedType(type: string): type is SupportedType {
    return this.supportedTypes.includes(type as SupportedTypeEnum);
  }

  /**
   * Checks if the given operator is a supported operator.
   *
   * @param operator - The operator to check.
   * @returns A boolean indicating whether the operator is supported.
   */
  static isOperator(operator: string): operator is Operator {
    return this.supportedOperators.includes(operator);
    // return true;
  }

  /**
   * Checks if the provided value is a valid ConditionValue.
   *
   * @param value - The value to check.
   * @returns True if the value is a ConditionValue, false otherwise.
   */
  static isConditionValue(value: unknown): value is ConditionValue {
    return (
      typeof value === 'boolean' ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date ||
      (Array.isArray(value) && value.every((v) => this.isConditionValue(v))) ||
      typeof value === 'object'
    );
  }
}
