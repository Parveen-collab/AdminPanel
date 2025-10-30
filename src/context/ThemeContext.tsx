import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  theme: 'light' | 'dark';
  primaryColor: string;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'system';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    return localStorage.getItem('themePrimary') || '#1976d2';
  });

  useEffect(() => {
    const updateTheme = () => {
      if (mode === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      } else {
        setTheme(mode);
      }
    };

    updateTheme();
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(newMode);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem('themePrimary', color);
  };

  return (
    <ThemeContext.Provider value={{ mode, theme, primaryColor, setMode, toggleTheme, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

