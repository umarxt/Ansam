import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";

export interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  emp_code: string | null;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  can: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const { user } = await api.get<{ user: User | null }>("/auth/me");
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(username: string, password: string) {
    const { user } = await api.post<{ user: User }>("/auth/login", { username, password });
    setUser(user);
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  const isAdmin = user?.role === "admin";
  const can = (perm: string) => isAdmin || Boolean(user?.permissions?.includes(perm));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, isAdmin, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
