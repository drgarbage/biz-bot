import { Container, Stack, CircularProgress } from '@mui/material';
import LineLayout from '@/components/layout-line';

const page = () => 
  <Container sx={{
    height: '100vh', 
    display: 'flex', 
    alignItems: 'center',
  }}>
    <Stack 
      gap={1} 
      sx={{flex:1, alignItems: 'center'}} 
      orientation="vertical"
    >
      <CircularProgress />
      <small>正在讀取介面</small>
    </Stack>
  </Container>

page.getLayout = (page) =>
  <LineLayout>{page}</LineLayout>

export default page;