import { createContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextProps {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)
