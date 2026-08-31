export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://opd-gateway.onrender.com/api/v1'
    : 'http://localhost:5000/api/v1');
