import { MessageCode } from '@constants/message-code';

export class BaseResponseDto<T> {
    message: string;
    body: T | T[] | unknown | any;

    constructor(body: T | T[] | null = null, message = MessageCode.SUCCESS) {
        this.message = message;
        if (body instanceof String) {
            this.body = { ...body };
        } else {
            this.body = body;
        }
    }
}

export class CurrentUserDto {
    email: string;
    id: number;
    role?: string | string[];
}
