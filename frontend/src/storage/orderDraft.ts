import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OrderInput } from "../types/order";

const KEY = "order_draft";

export const saveOrderDraft = async (draft: Partial<OrderInput>) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(draft));
};

export const loadOrderDraft = async (): Promise<Partial<OrderInput> | null> => {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as Partial<OrderInput>;
  } catch {
    await AsyncStorage.removeItem(KEY);
    return null;
  }
};

export const clearOrderDraft = async () => {
  await AsyncStorage.removeItem(KEY);
};

