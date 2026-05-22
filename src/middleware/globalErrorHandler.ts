import type { NextFunction, Request, Response } from "express";

type AppError = {
  statusCode?: number;
  message?: string;
  error?: unknown;
  errors?: unknown;
};

const globalErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  const knownError = err as AppError;
  const statusCode = knownError.statusCode ?? 500;
  const message = knownError.message ?? "Internal Server Error";
  const errorDetails = knownError.error ?? knownError.errors ?? (err instanceof Error ? err.message : message);

  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails
  });
};

export default globalErrorHandler;
