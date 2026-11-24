import { createContext, use, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { palette, type Colors } from './colors'

type Mode = 'system' | 'light' | 'dark'

interface ThemeValue {
  mode: Mode
  setMode: (m: Mode) => void
  scheme: 'light' | 'dark'
  colors: Colors
}

const ThemeContext = createContext<ThemeValue | null>(null)

/** Same Context pattern as the web app, driven by the OS color scheme. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme() // re-renders when the OS appearance changes
  const [mode, setMode] = useState<Mode>('system')
  const scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode
  const value = useMemo(() => ({ mode, setMode, scheme, colors: palette[scheme] }), [mode, scheme])
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const ctx = use(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
