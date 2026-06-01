export class ApiResponse<T> {
  constructor(
    public readonly success: boolean,
    public readonly message: string,
    public readonly data?: T,
    public readonly errors?: unknown
  ) {}

  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  static error(message: string, errors?: unknown): ApiResponse<null> {
    return new ApiResponse<null>(false, message, null, errors);
  }
}
