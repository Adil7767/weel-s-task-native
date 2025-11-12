import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "current_order_id";

export const setCurrentOrderId = async (id: string) => {
  await AsyncStorage.setItem(KEY, id);
};

export const getCurrentOrderId = async () => {
  return AsyncStorage.getItem(KEY);
};

