import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../types/auth";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const persistAuth = async (token: string, user: User) => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
};

export const clearAuth = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};

export const getStoredAuth = async (): Promise<{ token: string; user: User } | null> => {
  const [[, token], [, userRaw]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
  if (!token || !userRaw) {
    return null;
  }
  try {
    const user = JSON.parse(userRaw) as User;
    return { token, user };
  } catch {
    await clearAuth();
    return null;
  }
};

