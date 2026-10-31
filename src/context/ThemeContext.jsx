import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const readInitial = () => {
  const attr = document.documentElement.dataset.theme;
  return attr === 'light' ? 'light' : 'dark';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('cc-theme', theme);
    } catch {
      // storage unavailable (private mode) — theme still applies for this visit
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(() => {
    const isDark = theme === 'dark';
    // t(darkClasses, lightClasses) — picks the class set for the active design.
    const t = (dark, light) => (isDark ? dark : light);
    return { theme, isDark, toggle, t };
  }, [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
