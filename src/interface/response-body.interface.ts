import { HttpStatus } from '@nestjs/common';

export interface IResponseBody {
    statusCode: HttpStatus | number;
    message: string;
    errorCode: number | string;
}
