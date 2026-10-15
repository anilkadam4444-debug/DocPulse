/**
 * DocPulse Design System Tokens
 * Strict healthcare SaaS palette: Deep Navy structural, Healthcare Teal action, soft neutral surfaces.
 */

export const colors = {
  // Primary Structural: Deep Navy
  navy: {
    50: '#F0F4F8',
    100: '#D9E2EC',
    200: '#BCCCDC',
    300: '#9FB3C8',
    400: '#627D98',
    500: '#486581',
    600: '#334E68',
    700: '#243B53',
    800: '#102A43',
    900: '#0F172A',
    950: '#0B1329',
  },
  // Primary Accent: Healthcare Teal
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488', // Primary CTA
    700: '#0F766E', // Hover & Focus
    800: '#115E59',
    900: '#134E4A',
  },
  // Canvas & Surfaces
  canvas: {
    default: '#F8FAFC',
    card: '#FFFFFF',
    subtle: '#F1F5F9',
    accentSubtle: '#F0FDFA',
    dark: '#0B1329',
  },
  // Text
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#64748B',
    inverted: '#FFFFFF',
    invertedMuted: '#94A3B8',
  },
  // Hairline Borders
  border: {
    subtle: '#E2E8F0',
    hover: '#CBD5E1',
    focus: '#0D9488',
    dark: '#1E293B',
  },
  // Status Colors (Always paired with text labels)
  status: {
    serving: '#0D9488',
    waiting: '#0284C7',
    delayed: '#D97706',
    cancelled: '#DC2626',
    success: '#16A34A',
  },
} as const;

export const typography = {
  fontSans: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontMono: '"JetBrains Mono", monospace',
  scale: {
    hero: 'clamp(2.25rem, 4vw, 3.5rem)', // 36px - 56px
    h1: 'clamp(1.875rem, 3vw, 2.5rem)',
    h2: '1.75rem', // 28px
    h3: '1.25rem', // 20px
    bodyLarge: '1.125rem', // 18px
    body: '1rem', // 16px
    bodySmall: '0.875rem', // 14px
    caption: '0.75rem', // 12px
  },
  lineHeight: {
    tight: 1.15,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.65,
  },
} as const;

export const radii = {
  none: '0px',
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  card: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
  elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
  modal: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  standard: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
  slow: '300ms cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
