const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return 'https://opd-gateway.onrender.com/api/v1';
    }
  }
  return envUrl || 'http://localhost:5000/api/v1';
};

export const API_URL = getApiUrl();

const apiUrl = API_URL;

export async function apiRequest<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body.error === 'string'
        ? body.error
        : body.error?.message || body.message || 'Something went wrong. Please try again.';
    throw new Error(message);
  }

  return body.data as T;
}