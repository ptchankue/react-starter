export const palette = {
  light: {
    bg: '#f7f8fa',
    surface: '#ffffff',
    surface2: '#f0f2f5',
    text: '#4a5160',
    textH: '#12151c',
    muted: '#6b7280',
    border: '#e3e6eb',
    accent: '#087ea4',
    accentContrast: '#ffffff',
    danger: '#b91c1c',
    success: '#15803d',
  },
  dark: {
    bg: '#15171c',
    surface: '#1d2027',
    surface2: '#262a33',
    text: '#c3c8d2',
    textH: '#f3f4f6',
    muted: '#8b93a1',
    border: '#2f343e',
    accent: '#58c4dc',
    accentContrast: '#0b1a20',
    danger: '#f87171',
    success: '#4ade80',
  },
}

export type Colors = typeof palette.light
