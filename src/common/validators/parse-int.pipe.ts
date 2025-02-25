import { isString } from 'class-validator';

import { ErrorCode } from '@/common/constants';
import {
  ArgumentMetadata,
  BadRequestException,
  ParseIntPipe,
  ParseIntPipeOptions,
} from '@nestjs/common';

export class ParseIntPipe1 extends ParseIntPipe {
  constructor(options?: ParseIntPipeOptions) {
    super(options);
  }

  async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
    try {
      return await super.transform(value, metadata);
    } catch (error) {
      if (error instanceof BadRequestException) {
        const response = error.getResponse();
        throw new BadRequestException({
          message: 'Invalid input data!',
          cause: isString(response) ? response : response,
          errorCode: ErrorCode.INVALID,
        });
      }
      throw error;
    }
  }
}
