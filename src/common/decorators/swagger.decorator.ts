import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiBodyOptions, ApiConsumes } from '@nestjs/swagger';

export const ApiFile = (options: ApiBodyOptions) => {
  return applyDecorators(ApiConsumes('multipart/form-data'), ApiBody(options));
};
