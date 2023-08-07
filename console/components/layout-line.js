import { WithLineContext } from '@/context/line-context';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useEffect } from 'react';

 
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function Layout({ children }) {

  return (
    <WithLineContext>
      <ThemeProvider theme={theme}>
        
        <CssBaseline />

        {children}

      </ThemeProvider>
    </WithLineContext>
  )
}