// [ERROR] Custom operational error class
export class AppError extends Error {
  statusCode: number;
  status: "fail" | "error";
  failData: Record<string, string> | null;
  messageKey: string;

  constructor(
    messageKey: string,
    statusCode: number,
    failData: Record<string, string> | null = null,
  ) {
    super(messageKey);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.failData = failData;
    this.messageKey = messageKey;

    Error.captureStackTrace(this, this.constructor);
  }
}