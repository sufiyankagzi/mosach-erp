import axios from "axios";

console.log("API BASE URL =", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ========================================
// ATTACH JWT TOKEN
// ========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("API Token =", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;