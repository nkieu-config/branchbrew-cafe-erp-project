import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ApiErrorCode } from '../errors/api-error-code.enum';
import { appBadRequest, appNotFound } from '../errors/app.exception';

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  function runFilter(exception: unknown) {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({
          method: 'POST',
          url: '/orders/1/void',
          requestId: 'req-test-1',
        }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exception, host);
    return { status, json };
  }

  it('formats AppException with explicit error code', () => {
    const { status, json } = runFilter(
      appBadRequest(
        ApiErrorCode.ORDER_VOID_SAME_DAY_ONLY,
        'Only same-day orders can be voided.',
      ),
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ApiErrorCode.ORDER_VOID_SAME_DAY_ONLY,
        message: 'Only same-day orders can be voided.',
        path: '/orders/1/void',
        requestId: 'req-test-1',
      }),
    );
  });

  it('maps legacy NotFoundException to NOT_FOUND', () => {
    const { status, json } = runFilter(
      appNotFound(ApiErrorCode.ORDER_NOT_FOUND, 'Order not found'),
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ApiErrorCode.ORDER_NOT_FOUND,
        message: 'Order not found',
      }),
    );
  });

  it('returns INTERNAL_ERROR for unknown exceptions', () => {
    const { status, json } = runFilter(new Error('boom'));

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ApiErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred.',
      }),
    );
  });
});
