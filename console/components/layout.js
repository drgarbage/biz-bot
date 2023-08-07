import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './navbar'
import Footer from './footer'
 
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

export default function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      
      <CssBaseline />

      <Box sx={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      
        <Navbar />

        {children}

      </Box>

    </ThemeProvider>
  )
}