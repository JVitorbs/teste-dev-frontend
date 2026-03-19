import { createContext, useContext, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { storage } from "../lib/storage";
import type { User } from "../types/api";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [user, setUser] = useState<User | null>(storage.getUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      setSession: (nextToken, nextUser) => {
        storage.setToken(nextToken);
        storage.setUser(nextUser);
        setToken(nextToken);
        setUser(nextUser);
      },
      clearSession: () => {
        storage.clearSession();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
};
