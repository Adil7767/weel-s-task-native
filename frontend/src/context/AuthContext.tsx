import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, login as loginRequest } from "../api/auth";
import type { User } from "../types/auth";
import { clearAuth, getStoredAuth, persistAuth } from "../storage/auth";

type AuthState = {
  user: User | null;
  token: string | null;
  initializing: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    initializing: true,
  });

  useEffect(() => {
    void (async () => {
      const stored = await getStoredAuth();
      if (!stored) {
        setState((prev) => ({ ...prev, initializing: false }));
        return;
      }
      setState({ user: stored.user, token: stored.token, initializing: false });
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    await persistAuth(response.token, response.user);
    setState({ user: response.user, token: response.token, initializing: false });
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setState({ user: null, token: null, initializing: false });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = state.token;
    if (!token) {
      return;
    }
    const data = await fetchMe();
    setState((prev) => ({ ...prev, user: data }));
    await persistAuth(token, data);
  }, [state.token]);

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      refreshUser,
    }),
    [state, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

