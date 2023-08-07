import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLineContext } from "@/context/line-context";
import { 
  Container, Stack, TextField,
  Button, Avatar, Box, Divider,
} from "@mui/material";
import { companyInfo, setupLineUserConfig } from "@/lib/api-company";
import BANField from '@/components/view-ban';
import LineLayout from '@/components/layout-line';
import Head from "next/head";


const Section = ({children}) =>
  <Box sx={{
    textAlign: 'center', 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: 'gray'
  }}>{children}</Box>

const page = () => {
  const router = useRouter();
  const { profile } = useLineContext();
  const [configs, setConfigs] = useState({
    companyBAN: null,
    eInvoiceAccount: null,
    eInvoicePassword: null
  });

  const saveAndContinue = async () => {
    try{
      await setupLineUserConfig({
        userId: profile.userId,
        ...configs
      });
      router.replace('/line/setup/saved');
    }catch(err){
      console.error(err);
      alert(err.message);
    }
  }

  useEffect(()=>{
    if(!profile?.userId) return;
    setConfigs({
      companyBAN: profile.companies[0],
      eInvoiceAccount: profile.eInvoiceAccount,
      eInvoicePassword: profile.eInvoicePassword
    });
  }, [profile, setConfigs]);

  const isReadyForSave = 
    !!profile?.userId &&
    !!configs?.companyBAN &&
    !!configs?.eInvoiceAccount &&
    !!configs?.eInvoicePassword;

  return (
    <Container>
      
      <Head>
        <title>修改設定</title>
      </Head>

      <Stack gap={2} mt={2}>

        {!!profile &&

          <Stack direction="row" gap={1} alignItems="center">
            <Avatar 
              sx={{width:24,height:24}}
              alt={profile?.displayName} 
              src={profile?.pictureUrl} 
              />
            <small>{profile?.displayName}</small>
          </Stack>

        }

        {!!profile &&
          <Divider />
        }

        <Section>公司基本資料</Section>

        <BANField 
          fullWidth
          size="small"
          label="統一編號"
          placeholder="請輸入貴公司統一編號"
          value={configs?.companyBAN || ''}
          onChange={e => setConfigs({...configs, companyBAN: e.target.value})}
          />


        <Section>電子發票帳號</Section>

        <TextField 
          fullWidth
          size="small"
          label="帳號"
          placeholder="請輸入您的帳號，通常為統一編號"
          value={configs?.eInvoiceAccount || ''}
          onChange={e => setConfigs({...configs, eInvoiceAccount: e.target.value})}
          />

        <TextField 
          fullWidth
          size="small"
          label="密碼"
          type="password"
          placeholder="請輸入密碼"
          value={configs?.eInvoicePassword || ''}
          onChange={e => setConfigs({...configs, eInvoicePassword: e.target.value})}
          />

        <Button 
          fullWidth 
          variant="contained"
          disabled={!isReadyForSave}
          onClick={saveAndContinue}
        >
          儲存並繼續
        </Button>
      </Stack>

    </Container>
  );
}

page.getLayout = (page) =>
  <LineLayout>
    {page}
  </LineLayout>

export default page;