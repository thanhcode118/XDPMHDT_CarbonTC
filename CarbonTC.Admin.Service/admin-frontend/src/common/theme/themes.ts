import { createTheme, type ThemeOptions } from '@mui/material/styles';

import {
  brand,
  gray,
  errorColor,
  infoTextColor,
  primaryBackground,
  primaryTextColor,
  secondaryTextColor,
  successColor,
  warningColor,
  labelColor,
  darkModeColors,
} from '../color.ts';

// Common component styles for both themes
const getCommonComponents = (mode: 'light' | 'dark') => ({
  MuiTypography: {
    styleOverrides: {
      root: {
        a: { color: mode === 'light' ? labelColor : brand[400] },
      },
    },
    defaultProps: {
      variant: 'body1' as const,
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none' as const,
        padding: '8px 16px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
      contained: {
        backgroundColor: brand[450],
        color: '#ffffff',
        '&:hover': {
          backgroundColor: brand[600],
        },
      },
      outlined: {
        borderColor: mode === 'light' ? gray[700] : gray[600],
        fontWeight: 'bold',
        color: mode === 'light' ? primaryTextColor : '#ffffff',
        '&:hover': {
          backgroundColor: mode === 'light' ? gray[100] : gray[800],
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        width: 'max-content',
        background: 'transparent',
        padding: '4px',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${mode === 'light' ? gray[300] : 'rgba(255, 255, 255, 0.12)'}`,
        borderRadius: 12,
        padding: '24px',
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        ':hover': {
          color: mode === 'light' ? gray[900] : gray[100],
          textDecoration: 'underline',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '.MuiInputBase-root.MuiOutlinedInput-root.Mui-error': {
          '&:hover fieldset': {
            borderColor: errorColor,
          },
          '& fieldset': {
            borderWidth: '1px',
            borderColor: `${errorColor} !important`,
          },
        },
        '.MuiInputBase-root.MuiOutlinedInput-root': {
          borderColor:
            mode === 'light' ? '#e6e8ee' : 'rgba(255, 255, 255, 0.23)',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderWidth: '1px',
            borderColor: `${mode === 'light' ? gray[500] : 'rgba(255, 255, 255, 0.23)'} !important`,
          },
          '&:hover fieldset': {
            borderWidth: '1px',
          },
          '&.Mui-focused fieldset': {
            borderWidth: '1px !important',
          },
        },
        input: {
          padding: '8px 12px',
          fontSize: '16px',
          fontWeight: 400,
          borderWidth: 'thin',
        },
      },
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        span: {
          fontSize: '14px',
          fontWeight: 500,
        },
      },
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: {
        fontSize: '16px',
        fontWeight: 600,
        marginBottom: '8px',
        display: 'block',
        color: mode === 'light' ? labelColor : gray[300],
        textAlign: 'left' as const,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: mode === 'light' ? gray[300] : 'rgba(255, 255, 255, 0.12)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: 8,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: `1px solid ${mode === 'light' ? gray[300] : 'rgba(255, 255, 255, 0.12)'}`,
        backgroundColor:
          mode === 'light'
            ? primaryBackground
            : darkModeColors.background.secondary,
      },
    },
  },
  MuiListItemText: {
    styleOverrides: {
      root: {
        span: {
          fontSize: '16px',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)'}`,
      },
      head: {
        fontWeight: 600,
        backgroundColor:
          mode === 'light' ? gray[50] : darkModeColors.background.paper,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 500,
      },
    },
  },
});

// Light Theme Options
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: brand[450],
      light: brand[400],
      dark: brand[600],
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryTextColor,
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#757575',
    },
    error: { main: errorColor },
    warning: { main: warningColor },
    info: { main: infoTextColor },
    success: { main: successColor },
    background: {
      default: primaryBackground,
      paper: primaryBackground,
    },
    text: {
      primary: primaryTextColor,
      secondary: secondaryTextColor,
    },
    grey: gray,
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 500 },
    body2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 2 },
    subtitle1: { fontSize: '1rem', fontWeight: 400, lineHeight: 2 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 2 },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 2,
      textTransform: 'none',
    },
  },
  shape: { borderRadius: 8 },
  components: getCommonComponents('light'),
};

// Dark Theme Options
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: brand[400],
      light: brand[300],
      dark: brand[600],
      contrastText: '#000000',
    },
    secondary: {
      main: '#b0b0b0',
      light: '#e0e0e0',
      dark: '#808080',
      contrastText: '#ffffff',
    },
    error: { main: '#ef5350' },
    warning: { main: '#ff9800' },
    info: { main: '#03a9f4' },
    success: { main: '#4caf50' },
    background: {
      default: darkModeColors.background.primary,
      paper: darkModeColors.background.secondary,
    },
    text: {
      primary: darkModeColors.text.primary,
      secondary: darkModeColors.text.secondary,
    },
    grey: gray,
  },
  typography: lightThemeOptions.typography,
  shape: lightThemeOptions.shape,
  components: getCommonComponents('dark'),
};

// Create themes
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

// Helper function to get theme based on mode
export const getTheme = (mode: 'light' | 'dark') => {
  return mode === 'light' ? lightTheme : darkTheme;
};

// Default export for compatibility with old code
export default lightTheme;
