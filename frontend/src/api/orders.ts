import { api } from "./client";
import type { Order, OrderInput } from "../types/order";

export const createOrder = async (payload: OrderInput) => {
  const { data } = await api.post<Order>("/orders", payload);
  return data;
};

export const getOrder = async (id: string) => {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
};

export const updateOrder = async (id: string, payload: Partial<OrderInput>) => {
  const { data } = await api.put<Order>(`/orders/${id}`, payload);
  return data;
};

