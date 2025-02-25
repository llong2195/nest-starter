import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource, EntityTarget } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
@ValidatorConstraint({ name: 'IsExist', async: true })
export class IsExist implements ValidatorConstraintInterface {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * It takes a value, a validationArguments object, and a repository, and returns true if the value
   * exists in the repository
   * @param {string} value - the value of the field being validated
   * @param {ValidationArguments} validationArguments - ValidationArguments
   * @returns A boolean value.
   */
  async validate(value: string, validationArguments: ValidationArguments) {
    const entity = validationArguments.constraints[0] as EntityTarget<any>;
    const pathToProperty = validationArguments.constraints[1] as string;
    const repo = this.dataSource.getRepository(entity);
    if (!value || !entity || !pathToProperty || !repo) {
      return false;
    }

    const rs: unknown = await repo.findOne({
      where: {
        [pathToProperty ? pathToProperty : validationArguments.property]:
          pathToProperty
            ? (value as unknown as Record<string, unknown>)?.[pathToProperty] ||
              value
            : value,
      },
    });
    if (typeof rs === 'undefined') {
      return false;
    }
    return Boolean(rs);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments?.value}" is not exist.`;
  }
}
