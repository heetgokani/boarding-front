import axios from "axios";

// ===== CHANGE ONLY THIS LINE when you host the backend (example: https://your-app.onrender.com/api) =====
const BASE_URL = "http://localhost:5000/api";
// =======================================================================================================

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response &&
      err.response.status === 401 &&
      localStorage.getItem("token")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
