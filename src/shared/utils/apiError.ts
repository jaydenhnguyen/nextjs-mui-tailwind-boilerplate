import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { FieldValues, Path, UseFormSetError } from 'react-hook-form';

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'canceled' | 'unknown';

export const API_ERROR_MESSAGES = {
  [StatusCodes.BAD_REQUEST]: 'Please check your input and try again',
  [StatusCodes.UNAUTHORIZED]: 'Your session has expired, please sign in again',
  [StatusCodes.FORBIDDEN]: "You don't have permission to do that",
  [StatusCodes.NOT_FOUND]: "We couldn't find what you're looking for",
  [StatusCodes.CONFLICT]: 'This conflicts with existing data',
  [StatusCodes.UNPROCESSABLE_ENTITY]: 'Please fix the highlighted fields',
  [StatusCodes.TOO_MANY_REQUESTS]: 'Too many requests, please wait a moment',
  serverError: 'Something went wrong on our side, please try again',
  network: "Can't reach the server, please check your connection",
  timeout: 'The server took too long to respond, please try again',
  canceled: 'The request was canceled',
  unknown: 'Something went wrong, please try again',
} as const;

type ApiErrorInit = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string>;
  data?: unknown;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly fieldErrors: Record<string, string>;
  readonly data?: unknown;

  constructor({ kind, message, status, code, fieldErrors, data, cause }: ApiErrorInit) {
    super(message, { cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors ?? {};
    this.data = data;
  }

  get isServerError() {
    return this.status !== undefined && this.status >= 500;
  }

  get hasFieldErrors() {
    return Object.keys(this.fieldErrors).length > 0;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

type ParsedBody = { message?: string; code?: string; fieldErrors?: Record<string, string> };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const firstString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

// Backends shape error bodies differently, so this is the one place to adjust for yours.
function parseErrorBody(body: unknown): ParsedBody {
  if (!isRecord(body)) return {};

  const fieldErrors: Record<string, string> = {};
  const rawErrors = body['fieldErrors'] ?? body['errors'];

  if (isRecord(rawErrors)) {
    for (const [field, value] of Object.entries(rawErrors)) {
      const message = firstString(value);
      if (message) fieldErrors[field] = message;
    }
  } else if (Array.isArray(rawErrors)) {
    for (const item of rawErrors) {
      if (!isRecord(item)) continue;
      const field = firstString(item['field'] ?? item['path'] ?? item['property']);
      const message = firstString(item['message']);
      if (field && message) fieldErrors[field] = message;
    }
  }

  return {
    message: firstString(body['message']) ?? firstString(body['error']),
    code: firstString(body['code']),
    fieldErrors,
  };
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (axios.isCancel(error)) {
    return new ApiError({ kind: 'canceled', message: API_ERROR_MESSAGES.canceled, cause: error });
  }

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status, data } = error.response;
      const parsed = parseErrorBody(data);
      const fallback =
        status >= 500
          ? API_ERROR_MESSAGES.serverError
          : (API_ERROR_MESSAGES[status as keyof typeof API_ERROR_MESSAGES] ?? API_ERROR_MESSAGES.unknown);

      return new ApiError({
        kind: 'http',
        status,
        // Server messages on 5xx are usually stack-trace noise, so users get the friendly one instead.
        message: status < 500 && parsed.message ? parsed.message : fallback,
        code: parsed.code,
        fieldErrors: parsed.fieldErrors,
        data,
        cause: error,
      });
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({ kind: 'timeout', message: API_ERROR_MESSAGES.timeout, cause: error });
    }

    return new ApiError({ kind: 'network', message: API_ERROR_MESSAGES.network, cause: error });
  }

  return new ApiError({
    kind: 'unknown',
    message: error instanceof Error ? error.message : API_ERROR_MESSAGES.unknown,
    cause: error,
  });
}

export function applyApiErrorToForm<T extends FieldValues>(setError: UseFormSetError<T>, error: unknown): boolean {
  const apiError = toApiError(error);

  if (apiError.hasFieldErrors) {
    for (const [field, message] of Object.entries(apiError.fieldErrors)) {
      setError(field as Path<T>, { type: 'server', message });
    }
    return true;
  }

  setError('root.server', { type: 'server', message: apiError.message });
  return false;
}
