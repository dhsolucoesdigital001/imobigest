import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ThemeConfig } from '@/api/entities';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [themeConfig, setThemeConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadThemeConfig = useCallback(async () => {
    try {
      const configs = await ThemeConfig.list();
      const config = configs.length > 0 ? configs[0] : { tema_padrao: 'Automático', permitir_alternancia: true };
      setThemeConfig(config);
      
      // Determinar tema inicial
      const savedTheme = localStorage.getItem('theme');
      let initialTheme = 'light';

      if (savedTheme && config.permitir_alternancia) {
        initialTheme = savedTheme;
      } else {
        switch (config.tema_padrao) {
          case 'Claro':
            initialTheme = 'light';
            break;
          case 'Escuro':
            initialTheme = 'dark';
            break;
          case 'Automático':
            initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            break;
        }
      }

      setTheme(initialTheme);
      applyTheme(initialTheme);
    } catch (error) {
      console.error('Erro ao carregar configuração de tema:', error);
      setTheme('light');
      applyTheme('light');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThemeConfig();
  }, [loadThemeConfig]);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    if (!themeConfig?.permitir_alternancia) return;
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    canToggle: themeConfig?.permitir_alternancia || false,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};