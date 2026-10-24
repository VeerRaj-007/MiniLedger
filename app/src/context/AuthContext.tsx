import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken as persistToken, clearToken } from "../api/client";

interface AuthContextValue {
  token: string | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Same shape as React's Context API — the only RN-specific bit is reading
// the persisted token from AsyncStorage (the RN equivalent of
// localStorage) once on mount, instead of synchronously.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then((t) => {
      setTokenState(t);
      setLoading(false);
    });
  }, []);

  async function signIn(newToken: string) {
    await persistToken(newToken);
    setTokenState(newToken);
  }

  async function signOut() {
    await clearToken();
    setTokenState(null);
  }

  return (
    <AuthContext.Provider value={{ token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
