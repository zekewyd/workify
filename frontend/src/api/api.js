import axios from "axios";

const getToken = () =>
  localStorage.getItem("accessToken");

const api = axios.create({ baseURL: "https://workify-pearl.vercel.app" });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
