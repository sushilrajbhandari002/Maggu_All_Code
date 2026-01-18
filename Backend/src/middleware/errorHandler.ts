import type { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// 404 handler
export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: 'Not Found' });
}

// Central error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof HttpError) {
    return res
      .status(err.statusCode)
      .json({ message: err.message, details: err.details });
  }

  return res.status(500).json({ message: 'Internal Server Error' });
}

