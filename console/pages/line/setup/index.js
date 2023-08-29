import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLineContext } from "@/context/line-context";
import { 
  Container, Stack, TextField,
  Button, Avatar, Box, Divider, ButtonGroup, List, ListItem, ListItemText,
} from "@mui/material";
import { companyInfo, setupLineUserConfig, invoicePackages as fetchInvoicePackages, appendInvoicePackagesByCSV } from "@/lib/api-company";
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
  const [invoicePackages, setInvoicePackages] = useState([]);
  const [state, setState] = useState(0);

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const csv = event.target.result;
          await appendInvoicePackagesByCSV(profile.companies[0], csv);
          alert('檔案已上傳！');
          setState(state+1);
        };
        reader.readAsText(file);
      } catch (error) { 
        console.error("Error uploading CSV:", error);
      }
    }
  };

  useEffect(()=>{
    if(!profile?.userId) return;
    setConfigs({
      companyBAN: profile.companies[0],
      eInvoiceAccount: profile.eInvoiceAccount,
      eInvoicePassword: profile.eInvoicePassword
    });
  }, [profile, setConfigs]);

  useEffect(()=>{
    if(!profile?.userId) return;
    fetchInvoicePackages(profile.companies[0], new Date().getMonth())
      .then(setInvoicePackages)
      .catch(console.error);
  }, [profile, state]);

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

        {/* 如果只有一家公司，直接顯示公司資料跟發票字軌管理 */}
        {/* 如果有多家公司，顯示公司管理 */}

        <Section>公司基本資料</Section>

        <BANField 
          fullWidth
          size="small"
          label="統一編號"
          placeholder="請輸入貴公司統一編號"
          value={configs?.companyBAN || ''}
          onChange={e => setConfigs({...configs, companyBAN: e.target.value})}
          />

        <List>
        { !!invoicePackages && invoicePackages.map( item => 
          <ListItem>
            <ListItemText 
              primary={item.group}
              secondary={`${item.prefix}${item.begin}-${item.prefix}${item.end}`}
              />
          </ListItem>
          )}
        </List>

        <ButtonGroup fullWidth>

          <Button 
            disabled
            variant="contained">
            發票字軌
          </Button>

          <Button 
            variant="contained"
            onClick={()=>{}}
          >
            手動加入
          </Button>

          <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              id="csvInput"
            />

          <Button 
            variant="contained"
            onClick={() => document.getElementById('csvInput').click()}
          >
            上傳
          </Button>
          
        </ButtonGroup>

        <Button 
          fullWidth 
          variant="contained"
          disabled={!isReadyForSave}
          onClick={saveAndContinue}
        >
          加入另一家公司
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