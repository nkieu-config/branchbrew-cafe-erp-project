import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from './api-error-code.enum';

export type AppErrorBody = {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
};

export class AppException extends HttpException {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}

export function appBadRequest(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): AppException {
  return new AppException(code, message, HttpStatus.BAD_REQUEST, details);
}

export function appNotFound(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): AppException {
  return new AppException(code, message, HttpStatus.NOT_FOUND, details);
}

export function appForbidden(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): AppException {
  return new AppException(code, message, HttpStatus.FORBIDDEN, details);
}

export function isAppException(error: unknown): error is AppException {
  return error instanceof AppException;
}

export function readAppErrorBody(error: HttpException): AppErrorBody {
  const response = error.getResponse();
  if (typeof response === 'object' && response !== null && 'code' in response) {
    const body = response as AppErrorBody;
    return {
      code: body.code,
      message: body.message,
      details: body.details,
    };
  }

  const message =
    typeof response === 'string'
      ? response
      : typeof response === 'object' &&
          response !== null &&
          'message' in response
        ? String((response as { message: unknown }).message)
        : error.message;

  return {
    code: ApiErrorCode.VALIDATION_ERROR,
    message,
  };
}
