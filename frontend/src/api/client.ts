import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.multiRemove(["auth_token", "auth_user"]);
    }
    return Promise.reject(error);
  }
);

