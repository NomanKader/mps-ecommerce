import axios from 'axios';

type BackendErrorResponse = {
  errors?: Record<string, unknown>;
  message?: string;
};

export class ApiError extends Error {
  details?: Record<string, unknown>;
  status?: number;

  constructor(message: string, status?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
    this.status = status;
  }
}

export const toApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<BackendErrorResponse>(error)) {
    const status = error.response?.status;
    const fallbackMessage =
      status === 401
        ? 'Your session has expired. Please sign in again.'
        : status === 403
          ? 'You do not have access to this tenant or action.'
          : status === 429
            ? 'Please wait before trying again.'
            : status && status >= 500
              ? 'Something went wrong. Please try again.'
              : 'Unable to complete your request.';

    return new ApiError(
      error.response?.data?.message ?? fallbackMessage,
      status,
      error.response?.data?.errors,
    );
  }

  return new ApiError(error instanceof Error ? error.message : 'Unable to complete your request.');
};
