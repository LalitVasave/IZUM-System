import axios from 'axios';

/** Pull a human-readable message from an axios/API failure (works with unknown). */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const d = error.response?.data;
    if (d && typeof d === 'object') {
      const msg = (d as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) return msg;
      const err = (d as { error?: unknown }).error;
      if (typeof err === 'string' && err.trim()) return err;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
