import { createContext } from 'react';

export type AuthContextValue = {
  isAuth: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  requestRegistration: (email: string, password: string) => Promise<string>;
  confirmRegistration: (code: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
