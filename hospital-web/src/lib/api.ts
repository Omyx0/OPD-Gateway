const PRODUCTION_API = "https://opd-gateway.onrender.com/api/v1";
const LOCAL_API = "http://localhost:5000/api/v1";

const getApiUrl = () => {
  // If running on a deployed domain (not localhost), always use production API
  if (
    typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1")
  ) {
    return PRODUCTION_API;
  }
  return import.meta.env.VITE_API_URL || LOCAL_API;
};

export const API_URL = getApiUrl();
