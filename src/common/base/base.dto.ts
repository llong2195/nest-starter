import { MessageCode } from '../constants';

export class BaseResponseDto<T> {
  message: string;
  body: T | T[] | null;

  constructor(body: T | T[] | null = null, message = MessageCode.SUCCESS) {
    this.message = message;
    this.body = body;
  }

  static Ok<T>(body: T | T[] | null = null, message = MessageCode.SUCCESS) {
    return new BaseResponseDto(body, message);
  }
}

export class CurrentUserDto {
  email: string;
  id: number;
  role?: string | string[];
}
