export class AppError extends Error {
  statusCode: number;
  status: "fail" | "error";
  failData: Record<string, string> | null;
  messageKey: string;
  interpolation?: Record<string, any>;

  constructor(
    messageKey: string,
    statusCode: number,
    failData: Record<string, string> | null = null,
    interpolation?: Record<string, any>,
  ) {
    super(messageKey);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.failData = failData;
    this.messageKey = messageKey;
    this.interpolation = interpolation;

    Error.captureStackTrace(this, this.constructor);
  }
}
