/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { Response } from 'express';
import { ApiErrorCode } from '../errors/api-error-code.enum';
import { isAppException, readAppErrorBody } from '../errors/app.exception';
import { RequestWithContext } from '../request-context';

type ErrorResponseBody = {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
  details?: unknown;
  requestId?: string;
  timestamp: string;
  path: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithContext>();

    const body = this.toErrorResponse(
      exception,
      request.url,
      request.requestId,
    );
    if (body.statusCode >= 500) {
      this.logger.error(
        JSON.stringify({
          event: 'http_exception',
          requestId: request.requestId,
          method: request.method,
          path: request.url,
          code: body.code,
          message: body.message,
          statusCode: body.statusCode,
        }),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toErrorResponse(
    exception: unknown,
    path: string,
    requestId?: string,
  ): ErrorResponseBody {
    const timestamp = new Date().toISOString();

    if (isAppException(exception)) {
      const body = readAppErrorBody(exception);
      return {
        statusCode: exception.getStatus(),
        code: body.code,
        message: body.message,
        details: body.details,
        requestId,
        timestamp,
        path,
      };
    }

    if (exception instanceof ThrottlerException) {
      return {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        code: ApiErrorCode.RATE_LIMITED,
        message: 'Too many requests. Please try again later.',
        requestId,
        timestamp,
        path,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = readAppErrorBody(exception);
      return {
        statusCode: status,
        code: this.mapHttpStatusToCode(status, body.message),
        message: body.message,
        details:
          typeof exception.getResponse() === 'object'
            ? (exception.getResponse() as { details?: unknown }).details
            : undefined,
        requestId,
        timestamp,
        path,
      };
    }

    const clientErrorStatus = this.readClientErrorStatus(exception);
    if (clientErrorStatus) {
      return {
        statusCode: clientErrorStatus,
        code: ApiErrorCode.VALIDATION_ERROR,
        message:
          clientErrorStatus === HttpStatus.PAYLOAD_TOO_LARGE
            ? 'Request body is too large.'
            : 'Invalid request.',
        requestId,
        timestamp,
        path,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ApiErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred.',
      requestId,
      timestamp,
      path,
    };
  }

  private readClientErrorStatus(exception: unknown): number | null {
    if (
      exception &&
      typeof exception === 'object' &&
      'statusCode' in exception
    ) {
      const status = exception.statusCode;
      if (typeof status === 'number' && status >= 400 && status < 500) {
        return status;
      }
    }
    return null;
  }

  private mapHttpStatusToCode(status: number, message: string): ApiErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return this.inferBadRequestCode(message);
      case HttpStatus.UNAUTHORIZED:
        return ApiErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return this.inferForbiddenCode(message);
      case HttpStatus.NOT_FOUND:
        return ApiErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ApiErrorCode.CONFLICT;
      default:
        return ApiErrorCode.INTERNAL_ERROR;
    }
  }

  private inferBadRequestCode(message: string): ApiErrorCode {
    if (message.includes('voided or refunded')) {
      return ApiErrorCode.ORDER_ALREADY_REVERSED;
    }
    if (message.includes('Only same-day orders can be voided')) {
      return ApiErrorCode.ORDER_VOID_SAME_DAY_ONLY;
    }
    if (message.includes('Only completed orders can be refunded')) {
      return ApiErrorCode.ORDER_REFUND_NOT_COMPLETED;
    }
    if (message.includes('should be voided, not refunded')) {
      return ApiErrorCode.ORDER_REFUND_SAME_DAY;
    }
    if (message.includes('Settlement for today is already approved')) {
      return ApiErrorCode.SETTLEMENT_ALREADY_APPROVED;
    }
    return ApiErrorCode.VALIDATION_ERROR;
  }

  private inferForbiddenCode(message: string): ApiErrorCode {
    if (message.includes('not assigned to a branch')) {
      return ApiErrorCode.BRANCH_NOT_ASSIGNED;
    }
    if (message.includes('do not have access')) {
      return ApiErrorCode.BRANCH_ACCESS_DENIED;
    }
    return ApiErrorCode.FORBIDDEN;
  }
}
