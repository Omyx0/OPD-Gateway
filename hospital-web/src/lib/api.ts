const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) {
    if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
      return "https://opd-gateway.onrender.com/api/v1";
    }
  }
  return envUrl || "http://localhost:5000/api/v1";
};

export const API_URL = getApiUrl();
