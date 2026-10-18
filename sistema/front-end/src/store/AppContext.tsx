import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchHealthCheck,
  logoutUser,
  restoreSession,
  setUnauthorizedHandler,
  type AuthUser,
} from '../services/api';

export type AppOption = 'acompanhar' | 'cadastrar' | 'adicionar-alunos' | null;

export interface SelectedStudent {
  readonly cpf?: string;
  readonly name: string;
  readonly company: string;
}

export interface SelectedAdvisor {
  readonly id: string;
  readonly name: string;
}

export interface AppContextValue {
  readonly user: AuthUser | null;
  readonly initializing: boolean;
  readonly option: AppOption;
  readonly selectedStudent: SelectedStudent | null;
  readonly selectedAdvisor: SelectedAdvisor | null;
  readonly theme: 'light' | 'dark';
  readonly systemOnline: boolean | null;
  readonly login: (userData: AuthUser) => void;
  readonly logout: () => void;
  readonly selectOption: (opt: AppOption) => void;
  readonly setSelectedStudent: (student: SelectedStudent | null) => void;
  readonly setSelectedAdvisor: (advisor: SelectedAdvisor | null) => void;
  readonly back: () => void;
  readonly toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [option, setOption] = useState<AppOption>(null);
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<SelectedAdvisor | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [systemOnline, setSystemOnline] = useState<boolean | null>(null);

  const clearState = useCallback((): void => {
    setUser(null);
    setOption(null);
    setSelectedStudent(null);
    setSelectedAdvisor(null);
  }, []);

  const logout = useCallback((): void => {
    logoutUser();
    clearState();
  }, [clearState]);

  useEffect(() => {
    setUnauthorizedHandler(clearState);
    return () => setUnauthorizedHandler(null);
  }, [clearState]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      restoreSession(),
      fetchHealthCheck().then(() => true).catch(() => false),
    ]).then(([restoredUser, isOnline]) => {
      if (cancelled) return;
      if (restoredUser) setUser(restoredUser);
      setSystemOnline(isOnline);
      setInitializing(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light');
  }, [theme]);

  const login = useCallback((userData: AuthUser): void => setUser(userData), []);
  const selectOption = useCallback((opt: AppOption): void => setOption(opt), []);
  const back = useCallback((): void => {
    setOption(null);
    setSelectedStudent(null);
  }, []);
  const toggleTheme = useCallback((): void => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      initializing,
      option,
      selectedStudent,
      selectedAdvisor,
      theme,
      systemOnline,
      login,
      logout,
      selectOption,
      setSelectedStudent,
      setSelectedAdvisor,
      back,
      toggleTheme,
    }),
    [
      user,
      initializing,
      option,
      selectedStudent,
      selectedAdvisor,
      theme,
      systemOnline,
      login,
      logout,
      selectOption,
      back,
      toggleTheme,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext deve ser utilizado dentro de um AppProvider.');
  }
  return ctx;
}
