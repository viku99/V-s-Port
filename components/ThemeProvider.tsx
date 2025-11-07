import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useEditor } from './EditorProvider';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  accentColor: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Helper to convert hex to RGB
const hexToRgb = (hex: string): string => {
    let c: any = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
};


export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const { siteContent } = useEditor();
    const [theme, setTheme] = useState<Theme>('dark');
    
    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const storedTheme = localStorage.getItem('portfolio-theme') as Theme;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
    }, []);
    
    // Apply theme changes to the DOM
    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);
    }, [theme]);

    const accentColor = siteContent?.theme?.accentColor || '#3b82f6';

    // Apply accent color changes to the DOM
    useEffect(() => {
        const root = window.document.documentElement;
        if (accentColor) {
            root.style.setProperty('--color-accent', accentColor);
            root.style.setProperty('--color-accent-rgb', hexToRgb(accentColor));
        }
    }, [accentColor]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);

    const value = {
        theme,
        toggleTheme,
        accentColor,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
