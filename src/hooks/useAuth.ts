import { create } from "zustand";
import { getToken, removeToken, setRefreshToken, setToken } from "../lib/auth";

interface User {
  id: string;
  email: string;
  role: string;
  nome?: string;
  perfil?: string;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!getToken(),
  login: (token, user, refreshToken) => {
    setToken(token);
    setRefreshToken(refreshToken);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    removeToken();
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user }),
}));
