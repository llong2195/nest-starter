import { Module } from '@nestjs/common';

import { IsEqualField } from './is-equal-field.validator';
import { IsExist } from './is-exist.validator';
import { IsNotExist } from './is-not-exist.validator';

@Module({
  imports: [],
  providers: [IsEqualField, IsExist, IsNotExist],
  exports: [IsEqualField, IsExist, IsNotExist],
})
export class ValidatorsModule {}
