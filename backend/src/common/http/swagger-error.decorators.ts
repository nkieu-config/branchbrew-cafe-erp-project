import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from './api-error-response.dto';

export function ApiAuthErrorResponses() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: ApiErrorResponseDto,
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many requests',
      type: ApiErrorResponseDto,
    }),
  );
}

export function ApiCommonErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad request',
      type: ApiErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: ApiErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      type: ApiErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Not found',
      type: ApiErrorResponseDto,
    }),
    ApiTooManyRequestsResponse({
      description: 'Too many requests',
      type: ApiErrorResponseDto,
    }),
  );
}
