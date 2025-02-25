import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  InternalServerErrorException,
  MethodNotAllowedException,
  RequestTimeoutException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

// 400
export const throwBadRequest = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new BadRequestException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 502
export const throwBadGateway = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new BadGatewayException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 409
export const throwConflict = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new ConflictException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 403
export const throwForbidden = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new ForbiddenException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 504
export const throwGatewayTimeout = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new GatewayTimeoutException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 500
export const throwInternalServerError = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new InternalServerErrorException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 405
export const throwMethodNotAllowed = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new MethodNotAllowedException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 408
export const throwRequestTimeout = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new RequestTimeoutException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 503
export const throwServiceUnavailable = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new ServiceUnavailableException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 401
export const throwUnauthorized = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new UnauthorizedException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};

// 415
export const UnsupportedMediaType = (
  error: string,
  cause: string | Record<string, unknown>,
  errorCode: number,
): void => {
  throw new UnsupportedMediaTypeException({
    message: error,
    cause: cause,
    errorCode: errorCode,
  });
};
