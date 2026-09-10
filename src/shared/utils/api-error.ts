/**
 * Normalises an unknown error thrown by axios / fetch into a display string.
 * The BFF proxy passes upstream error envelopes through unchanged, so the shape
 * is `{ response: { data: { error: { message } } } }`.
 */
export function extractApiError(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { error?: { message?: string } } };
    message?: string;
  };
  return err?.response?.data?.error?.message ?? err?.message ?? fallback;
}
