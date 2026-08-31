const apiUrl = import.meta.env.VITE_API_URL;

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