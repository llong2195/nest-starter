import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseError extends HttpException {
    protected errorCode: number;

    /**
     *
     * @param message
     * @param status
     * @param errorCode
     * @param cause
     */
    constructor(message: string | Record<string, any>, status: HttpStatus, errorCode: number, cause?: Error) {
        super(message, status, {
            cause: cause,
        });
        this.errorCode = errorCode;
    }

    /**
     * @returns {number}
     */
    getErrorCode(): number {
        return this.errorCode;
    }

    /**
     * @returns {number}
     */
    getMessage(): string {
        return this.message;
    }
}
