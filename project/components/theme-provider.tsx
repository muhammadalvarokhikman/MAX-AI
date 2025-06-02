"use client";

import { createContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export const ThemeContext = createContext<{
  userTheme: string | null;
  setUserTheme: (theme: string) => void;
}>({
  userTheme: null,
  setUserTheme: () => {},
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [userTheme, setUserTheme] = useState<string | null>(null);
  
  useEffect(() => {
    // Load the user's theme from localStorage
    const savedTheme = localStorage.getItem("maxai-user-theme");
    if (savedTheme) {
      setUserTheme(savedTheme);
      
      // Apply theme class to body
      const body = document.body;
      const themeClasses = ['theme-kid', 'theme-teen', 'theme-professional'];
      themeClasses.forEach(cls => body.classList.remove(cls));
      body.classList.add(savedTheme);
    }
  }, []);
  
  const handleSetUserTheme = (theme: string) => {
    setUserTheme(theme);
    localStorage.setItem("maxai-user-theme", theme);
    
    // Apply theme class to body
    const body = document.body;
    const themeClasses = ['theme-kid', 'theme-teen', 'theme-professional'];
    themeClasses.forEach(cls => body.classList.remove(cls));
    body.classList.add(theme);
  };

  return (
    <ThemeContext.Provider value={{ userTheme, setUserTheme: handleSetUserTheme }}>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}