import { createTheme } from '@mui/material/styles';

// Healthcare-focused color palette
// No gradients — clean, solid, trustworthy
export const palette = {
  primary: '#2E7D32',       // Deep green — health, nature, trust
  primaryDark: '#14532D',   // Xanh rừng sâu (hero, band nhấn)
  primaryLight: '#4CAF50',  // Medium green
  primarySoft: '#E8F5E9',   // Very light green bg
  secondary: '#1565C0',     // Medical blue — credibility, science
  secondaryLight: '#42A5F5',
  secondarySoft: '#E3F2FD',
  accent: '#7daf18',        // Brand green (existing)
  accentDark: '#6B9E12',    // Accent đậm (hover)
  accentLight: '#EDF7D5',
  warning: '#E65100',       // Urgency orange
  warningSoft: '#FFF3E0',
  error: '#C62828',
  surface: '#FFFFFF',
  background: '#FAFBFC',
  border: '#E8ECF0',
  // Footer (nền tối) — token riêng vì khác hệ sáng
  footerBg: '#0F172A',
  footerCard: '#1E293B',
  footerText: '#CBD5E1',
  footerMuted: '#64748B',
  footerBorder: '#334155',
  textPrimary: '#1A2332',
  textSecondary: '#5A6B7F',
  textMuted: '#8D99A8',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: palette.primary,
      light: palette.primaryLight,
    },
    secondary: {
      main: palette.secondary,
      light: palette.secondaryLight,
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.015em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});
