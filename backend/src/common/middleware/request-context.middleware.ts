import { Logger } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { randomUUID } from 'crypto';
import { REQUEST_ID_HEADER, RequestWithContext } from '../request-context';

const logger = new Logger('RequestContextMiddleware');

export function requestContextMiddleware(
  req: RequestWithContext,
  res: Response,
  next: NextFunction,
): void {
  const requestId = req.header(REQUEST_ID_HEADER) ?? randomUUID();
  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    logger.log(
      JSON.stringify({
        event: 'http_request',
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs,
        userAgent: req.get('user-agent'),
      }),
    );
  });

  next();
}
