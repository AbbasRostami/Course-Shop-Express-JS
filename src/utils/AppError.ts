// [ERROR] Custom operational error class
export class AppError extends Error {
  statusCode: number;
  status: "fail" | "error";
  failData: Record<string, string> | null;

  constructor(
    message: string,
    statusCode: number,
    failData: Record<string, string> | null = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.failData = failData;

    Error.captureStackTrace(this, this.constructor);
  }
}
