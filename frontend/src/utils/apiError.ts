export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { detail?: string } } }).response;
    if (response?.status === 403) return 'You are not authorized to perform this action.';
    return response?.data?.detail || fallback;
  }

  if (typeof error === 'object' && error !== null && 'request' in error) {
    return 'Unable to connect to SecureChain services.';
  }

  if (error instanceof Error && /network|timeout|failed to fetch|axios/i.test(error.message)) {
    return 'Unable to connect to SecureChain services.';
  }

  return fallback;
}
