// src/lib/utils/errors.ts
// Central error handler for the Accounting application

import { toastStore } from './toast.js';

/**
 * Error handling options
 */
export interface ErrorHandlerOptions {
  silent?: boolean;
  showToast?: boolean;
  userMessage?: string | null;
}

/**
 * Handles errors consistently with logging and user feedback
 * @param error The error that occurred
 * @param context Context of the error (e.g., "Save invoice")
 * @param options Optional configuration
 * @returns null
 */
export function handleError(
  error: Error | string | unknown,
  context: string,
  options: ErrorHandlerOptions = {}
): null {
  const {
    silent = false,
    showToast = true,
    userMessage = null
  } = options;

  const errorObj = error instanceof Error ? error : new Error(String(error));
  const errorMessage = errorObj.message || 'Unknown error';

  if (showToast && !silent) {
    const displayMessage = userMessage || `Error in ${context}: ${errorMessage}`;
    toastStore.error(displayMessage);
  }

  if (import.meta.env.PROD && !silent) {
    logToRemote(errorObj, context);
  }

  return null;
}

/**
 * Handles API errors with Response objects
 * @param response Fetch Response object
 * @param context Context of the API call
 * @returns Promise resolving to null
 */
export async function handleApiError(response: Response, context: string): Promise<null> {
  let errorMessage = `HTTP ${response.status}`;

  try {
    const data = await response.json() as { error?: string; message?: string };
    errorMessage = data.error || data.message || errorMessage;
  } catch {
    errorMessage = response.statusText || errorMessage;
  }

  handleError(
    new Error(errorMessage),
    context,
    { userMessage: `API error in ${context}: ${errorMessage}` }
  );

  return null;
}

/**
 * Outputs warning (less critical than error)
 * @param message Warning message
 * @param context Context
 * @param options Options
 */
export function handleWarning(message: string, context: string, options: { showToast?: boolean } = {}): void {
  const { showToast = true } = options;

  if (showToast) {
    toastStore.warning(`${context}: ${message}`);
  }
}

/**
 * Displays success message
 * @param message Success message
 */
export function handleSuccess(message: string): void {
  toastStore.success(message);
}

/**
 * Remote error logging (e.g., Sentry, LogRocket)
 * Placeholder for future integration
 * @param error Error object
 * @param context Context
 */
function logToRemote(error: Error, context: string): void {
  // TODO: Integration with error tracking service
  // Example:
  // if (window.Sentry) {
  //   Sentry.captureException(error, {
  //     tags: { context },
  //     level: 'error'
  //   });
  // }
}

/**
 * Custom error class with code property
 */
export class AppError extends Error {
  code: string;
  context?: string;

  constructor(message: string, code: string, context?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
  }
}

/**
 * Creates a validation error
 * @param message Error message
 * @param field Field that failed validation
 * @returns AppError instance
 */
export function validationError(message: string, field?: string): AppError {
  return new AppError(message, 'VALIDATION_ERROR', field);
}

/**
 * Creates a not found error
 * @param resource Resource that was not found
 * @returns AppError instance
 */
export function notFoundError(resource: string): AppError {
  return new AppError(`${resource} not found`, 'NOT_FOUND', resource);
}

/**
 * Creates a permission error
 * @param action Action that was not permitted
 * @returns AppError instance
 */
export function permissionError(action: string): AppError {
  return new AppError(`Permission denied: ${action}`, 'PERMISSION_DENIED', action);
}
