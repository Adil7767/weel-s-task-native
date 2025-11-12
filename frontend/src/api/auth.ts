import { api } from "./client";
import type { LoginResponse } from "../types/auth";

export const login = async (email: string, password: string) => {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  return data;
};

export const fetchMe = async () => {
  const { data } = await api.get<LoginResponse["user"]>("/me");
  return data;
};

