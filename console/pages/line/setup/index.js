import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLineContext } from "@/context/line-context";
import { 
  Container, Stack, 
  Button, Avatar, Box, Divider, Paper,
} from "@mui/material";
import BANField from '@/components/view-ban';
import BANProfile from '@/components/view-ban-profile';
import LineLayout from '@/components/layout-line';
import Head from "next/head";
import liff from "@line/liff";


const Section = ({children}) =>
  <Box sx={{
    textAlign: 'center', 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: 'gray'
  }}>{children}</Box>

const page = () => {
  const router = useRouter();
  const { profile, updateCompany, addCompany } = useLineContext();
  const [ companyBAN, setCompanyBAN ] = useState();

  useEffect(() => {
    if(!profile || !profile?.companies || profile?.companies?.length <= 0) return;
    setCompanyBAN(profile.companies[0]);
  }, [profile]);

  const saveAndContinue = async () => {
    try{
      if (profile?.companies.length > 0)
        await updateCompany(profile?.companies[0], companyBAN);
      else
        await addCompany(companyBAN);
    }catch(err){
      console.error(err);
      alert(err.message);
    }
  }

  const canSave = companyBAN?.length === 8;

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

        {/* 如果只有一家公司，直接顯示公司資料跟發票字軌管理 */}
        {/* 如果有多家公司，顯示公司管理 */}

        <Section>公司基本資料</Section>

        <BANField 
          fullWidth
          size="small"
          label="統一編號"
          placeholder="請輸入貴公司統一編號"
          value={companyBAN || ''}
          onChange={e => setCompanyBAN(e.target.value)}
          />

        { profile?.companies?.length > 0 && 
          <Paper sx={{p:1}}>
            <BANProfile companyBAN={profile?.companies[0]} />
          </Paper>
        }

        { profile?.companies?.length > 0 &&
          <Button
            fullWidth
            color="inherit"
            variant="contained"
            onClick={() => router.push(`/line/setup/companies/${profile?.companies[0]}`)}>
            管理發票字軌
          </Button>
        }

        <Button 
          fullWidth
          variant="contained"
          disabled={!canSave} 
          onClick={saveAndContinue}>
            儲存
        </Button>

        { profile?.companies?.length > 0 && 
          <Button
            fullWidth
            color="inherit"
            variant="contained"
            onClick={()=>router.push(`/line/setup/companies`)}>
            管理多個公司
          </Button>
        }

        <Button
          fullWidth
          color="inherit"
          variant="contained"
          onClick={()=>liff.closeWindow()}>
          關閉
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