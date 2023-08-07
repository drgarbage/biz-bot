import { Box, Container, Stack, Button } from "@mui/material";
import LineLayout from '@/components/layout-line';
import Head from "next/head";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const page = () => 
  <Container sx={{
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center'
  }}>
    
    <Head>
      <title>設定已儲存</title>
    </Head>

    <Box sx={{
      flex: 1, 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <CheckCircleOutlineIcon sx={{fontSize: 96, color: '#00DD00', mb: 1}} />
      <label>設定已儲存</label>
    </Box>

    <Button 
      fullWidth 
      sx={{mt:2, mb:4}}
      variant="contained"
      onClick={() => liff.closeWindow()}
    >
      關閉
    </Button>

  </Container>

page.getLayout = (page) =>
  <LineLayout>
    {page}
  </LineLayout>

export default page;