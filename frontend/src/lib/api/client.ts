const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export { API_URL };

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  let response: Response;
  try {
    response = await fetch(url, { ...defaultOptions, ...options });
  } catch {
    throw new Error(
      `Unable to reach the API at ${API_URL}. Start the backend with: npm run dev:backend`,
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error(errorData.message || 'An error occurred while fetching data');
  }

  if (response.status === 204) return null;

  const text = await response.text();
  if (!text || text.trim() === '') return null;
  try {
    return JSON.parse(text);
  } catch {
    console.error('Failed to parse JSON response:', text);
    return null;
  }
}
