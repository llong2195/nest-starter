import { ValidatorOptions } from 'class-validator';

import { HttpStatus, ValidationPipeOptions } from '@nestjs/common';

export const ValidationConfig: ValidatorOptions | ValidationPipeOptions = {
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  forbidNonWhitelisted: true,
  disableErrorMessages: false,
  skipMissingProperties: false,
};
