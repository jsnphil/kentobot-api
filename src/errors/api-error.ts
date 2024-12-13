export class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
