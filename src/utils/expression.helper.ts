/**
 * Helper class for evaluating mathematical expressions.
 * Supports basic arithmetic operations (+, -, *, /, %) and parentheses.
 * Uses Shunting Yard algorithm for expression parsing and evaluation.
 * If support for more complex operations is needed, consider using a library like `mathjs`.
 *
 * @example
 * ```typescript
 * const result = ExpressionHelper.evaluate('2 + 3 * (4 - 1)'); // Returns 11
 * ```
 */
export class ExpressionHelper {
  static supportedOperators = ['+', '-', '*', '/', '%'];
  static precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
  };

  private static isOperator(char: string): boolean {
    return this.supportedOperators.includes(char);
  }

  private static getPrecedence(operator: keyof typeof this.precedence): number {
    return this.precedence[operator] || 0;
  }

  private static evaluateOperation(
    operator: string,
    b: number,
    a: number,
  ): number {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return a / b;
      case '%':
        return a % b;
      default:
        throw new Error('Invalid operator');
    }
  }

  /**
   * Evaluates a mathematical expression string and returns the calculated result.
   * Supports basic arithmetic operations (+, -, *, /, %), decimal numbers, and nested parentheses.
   *
   * @sse https://en.wikipedia.org/wiki/Shunting-yard_algorithm
   *
   * @param expression - The mathematical expression to evaluate as a string
   * @returns The calculated result rounded to 2 decimal places
   *
   * @example
   * ```ts
   * // Simple arithmetic
   * evaluate("2 + 3") // returns 5
   *
   * // Complex expression with decimals and parentheses
   * evaluate("((6.5-2.1)*(4+2))/((3+1)*(2-1))") // returns 6.60
   * ```
   *
   * @throws {Error} If the expression is invalid or contains unsupported operations
   */
  public static evaluate(expression: string): number {
    /**
     * Shunting Yard algorithm for parsing and evaluating mathematical expressions.
     * @see https://en.wikipedia.org/wiki/Shunting-yard_algorithm
     * ```ts
     * The algorithm works as follows:
     * Steps:
     * - define a stack for operators and a queue for values
     * variables:
     * - tokens: string[] = ['(', '(', '6.5', '-', '2.1', ')', '*', '(', '4', '+', '2', ')', ')', '/', '(', '(', '3', '+', '1', ')', '*', '(', '2', '-', '1', ')', ')'];
     * - values: number[] = [];
     * - operators: string[] = []
     *
     *  - values: number[] = [];
     *  - operators: string[] = []
     *
     * 1. Tokenize the expression into numbers and operators using regex pattern matching (supports decimal numbers) and parentheses grouping (for nested expressions)
     * -- Example: '((6.5-2.1)*(4+2))/((3+1)*(2-1))'
     * -- Result: ['(', '(', '6.5', '-', '2.1', ')', '*', '(', '4', '+', '2', ')', ')', '/', '(', '(', '3', '+', '1', ')', '*', '(', '2', '-', '1', ')', ')']
     *
     * 2. Process each token and build the output queue using a stack for operators and a queue for values
     * -- For each token:
     * -- - If the token is a number, add it to the queue
     * -- - If the token is an operator, pop operators from the stack to the queue based on precedence
     * -- - If the token is '(', push it to the stack
     * -- - If the token is ')', pop operators from the stack to the queue until '(' is found
     *
     * 3. Evaluate the expression by popping operators and values from the stack and queue
     * 4. Return the final result
     * ```
     */

    const tokens = expression.match(/(\d*\.?\d+)|[()+\-*/%]/g) || [];
    const values: number[] = [];
    const operators: string[] = [];

    for (const token of tokens) {
      if (!isNaN(Number(token))) {
        values.push(Number(token));
      } else if (token === '(') {
        operators.push(token);
      } else if (token === ')') {
        while (operators.length && operators[operators.length - 1] !== '(') {
          const operator = operators.pop();
          const b = values.pop();
          const a = values.pop();
          if (operator !== undefined && a !== undefined && b !== undefined) {
            values.push(this.evaluateOperation(operator, b, a));
          } else {
            throw new Error('Invalid expression');
          }
        }
        operators.pop(); // Remove '('
      } else {
        while (
          operators.length &&
          operators[operators.length - 1] !== '(' &&
          this.getPrecedence(
            operators[operators.length - 1] as keyof typeof this.precedence,
          ) >= this.getPrecedence(token as keyof typeof this.precedence)
        ) {
          const operator = operators.pop();
          const b = values.pop();
          const a = values.pop();
          if (operator !== undefined && a !== undefined && b !== undefined) {
            values.push(this.evaluateOperation(operator, b, a));
          } else {
            throw new Error('Invalid expression');
          }
        }
        operators.push(token);
      }
    }

    while (operators.length) {
      const operator = operators.pop();
      if (operator !== undefined) {
        const b = values.pop();
        const a = values.pop();
        if (a !== undefined && b !== undefined) {
          values.push(this.evaluateOperation(operator, b, a));
        } else {
          throw new Error('Invalid expression');
        }
      }
    }

    return Number(values[0].toFixed(2));
  }
}
