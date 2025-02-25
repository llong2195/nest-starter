import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsEqualField', async: false })
export class IsEqualField implements ValidatorConstraintInterface {
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.property}" should be equal to "${validationArguments?.constraints?.[0]}.`;
  }

  /**
   * The function returns true if the value of the field being validated is equal to the value of the
   * field specified in the validationArguments.constraints[0] property
   * @param {any} value - The value that is being validated.
   * @param {ValidationArguments} [validationArguments] - This is an object that contains the
   * following properties:
   * @returns A boolean value.
   */
  validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    if (
      !validationArguments ||
      !validationArguments.object ||
      !validationArguments.constraints
    ) {
      return false;
    }
    const field = validationArguments.constraints[0] as string;
    return value === (validationArguments.object as Record<string, any>)[field];
  }
}
