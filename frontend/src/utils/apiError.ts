export function getApiErrorMessage(error: unknown, fallback: string): string {
  // Axios error with response (server responded with error status)
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { detail?: string | string[] } } }).response;
    
    // Handle specific status codes
    if (response?.status === 400) {
      const detail = response?.data?.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail.length > 0) {
        return detail.map((d: any) => d.msg || d).join(', ');
      }
      return 'Bad request. Please check your input.';
    }
    
    if (response?.status === 401) return 'Invalid credentials or session expired.';
    if (response?.status === 403) return 'You are not authorized to perform this action.';
    if (response?.status === 404) return 'Resource not found.';
    if (response?.status === 409) {
      const detail = response?.data?.detail;
      if (typeof detail === 'string') return detail;
      return 'Resource already exists.';
    }
    if (response?.status === 422) {
      const detail = response?.data?.detail;
      if (Array.isArray(detail) && detail.length > 0) {
        return detail.map((d: any) => `${d.loc?.join('.') || 'Field'}: ${d.msg}`).join(', ');
      }
      const detailStr = response?.data?.detail;
      if (typeof detailStr === 'string') return detailStr;
      return 'Validation error. Please check your input.';
    }
    if (response?.status === 500) return 'Server error. Please try again later.';
    
    // Return detail if available
    const detail = response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d: any) => d.msg || d).join(', ');
    }
  }

  // Axios error with request but no response (network error)
  if (typeof error === 'object' && error !== null && 'request' in error) {
    return 'Unable to connect to SecureChain services. Please check your connection.';
  }

  // Generic network errors
  if (error instanceof Error) {
    if (/network/i.test(error.message)) {
      return 'Network error. Please check your connection.';
    }
    if (/timeout/i.test(error.message)) {
      return 'Request timeout. Please try again.';
    }
    if (/failed to fetch/i.test(error.message)) {
      return 'Failed to connect to the server. Please check if the backend is running.';
    }
  }

  return fallback;
}
