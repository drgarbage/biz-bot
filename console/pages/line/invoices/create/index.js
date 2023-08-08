import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useLineContext } from "@/context/line-context";
import { createInvoice } from "@/lib/api-company";
import { 
  Avatar, Divider, Box, Container, Stack, TextField,
  Button, ButtonGroup, 
} from "@mui/material";
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
  const [invoice, setInvoice] = useState({
    sellerBAN: null,
    buyerBAN: null, // buyer_ban
    total: 0,
    taxType: 1, // 1: 應稅 2: 零稅率 3: 免稅
    tax: 0,
    amount: 0,
    items: [
      {               // item_sequence_number
        name: '',     // item_description
        price: 0,     // item_unit_price
        quantity: 1,  // item_quantity
      }
    ]
  });

  const setInvoiceItem = (index, item) => {
    const next = [...invoice.items];
    next[index] = {...next[index], ...item};
    setInvoice({...invoice, items: next});
  }

  const appendInvoiceItem = () => {
    const next = [...invoice.items, {name: '', price: 0, quantity: 0, amount: 0}];
    setInvoice({...invoice, items: next});
  }

  const confirmInvoice = async () => {
    if(!profile?.userId) return;
    try{
      const filtered = {
        ...invoice, 
        items: invoice.items.filter( p => 
          !!p.quantity &&
          parseFloat(p.quantity) > 0)
      };
      const invoiceId = await createInvoice(profile.userId, filtered);
      router.replace(`/line/invoices/${invoiceId}`);
    }catch(err){
      console.error(err.messenge);
      alert(err.messenger);
    }
  }

  useEffect(() => {
    if(!profile?.userId) return;
    const sellerBAN = profile.companies.length > 0 ? 
      profile.companies[0] : '';
    setInvoice({...invoice, sellerBAN });
  }, [profile, setInvoice]);

  const total = !!invoice.items ? 
    invoice.items.reduce((pre, cur)=> 
      pre + parseFloat(cur.price) * parseFloat(cur.quantity), 0):0;
  const tax = invoice?.taxType === 1 ? Math.round(total * 0.05) : 0;
  const amount = total + tax;
  const isReady = total > 0 &&
    invoice?.sellerBAN?.length > 0 &&
    invoice?.buyerBAN?.length > 0;

  return (
    <Container sx={{mb:4}}>
      
      <Head>
        <title>開立發票</title>
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

        <BANField 
          fullWidth
          size="small"
          label="開立人統一編號"
          placeholder="請輸入貴公司統編"
          value={invoice?.sellerBAN || ''}
          onChange={e => setInvoice({...invoice, sellerBAN: e.target.value})}
          />

        <BANField 
          fullWidth
          size="small"
          label="買受人統一編號"
          placeholder="請輸入客戶公司統編"
          value={invoice?.buyerBAN || ''}
          onChange={e => setInvoice({...invoice, buyerBAN: e.target.value})}
          />

        <Section>品項</Section>

        { !!invoice?.items && invoice.items.length > 0 &&
          invoice.items.map((item, index) =>
            <Box key={index}>
              <TextField 
                fullWidth
                size="small" 
                label="品項" 
                type="text" 
                value={item?.name || ''}
                onChange={e => setInvoiceItem(index, {name: e.target.value})}
                />
              <Stack mt={2} gap={1} direction="row">
                <TextField 
                  sx={{flex:1}} 
                  size="small" 
                  label="數量" 
                  type="number" 
                  value={item?.quantity || ''}
                  onChange={e => setInvoiceItem(index, {quantity: e.target.value})}
                  />
                <TextField 
                  sx={{flex:1}} 
                  size="small" 
                  label="單價" 
                  type="number" 
                  value={item?.price || ''}
                  onChange={e => setInvoiceItem(index, {price: e.target.value})}
                  />
              </Stack>
            </Box>
          )
        }

        <Button 
          fullWidth
          size="small"
          color="inherit"
          variant="contained"
          onClick={appendInvoiceItem}
        >
          增加項目
        </Button>

        <Divider />

        <ButtonGroup 
          fullWidth
          size="small"
          variant="contained" 
          color="inherit">
          <Button onClick={() => setInvoice({...invoice, taxType: 1})} color={invoice.taxType === 1 ? 'primary' : 'inherit'}>應稅</Button>
          <Button onClick={() => setInvoice({...invoice, taxType: 2})} color={invoice.taxType === 2 ? 'primary' : 'inherit'}>零稅率</Button>
          <Button onClick={() => setInvoice({...invoice, taxType: 3})} color={invoice.taxType === 3 ? 'primary' : 'inherit'}>免稅</Button>
        </ButtonGroup>

        <Box 
          flex={1} 
          display="flex" 
          flexDirection="column" 
          alignItems="flex-end"
          sx={{
            color: 'gray',
            backgroundColor: '#EEE',
            fontWeight: 'bold',
            borderRadius: 2,
            p: 1
          }}
          >
          { tax > 0 && <span>{`${total} + ${tax}`}</span>}
          <span style={{fontSize: 32}}>{amount}</span>
        </Box>

        <Button 
          fullWidth
          disabled={!isReady}
          variant="contained"
          onClick={confirmInvoice}
        >
          開立發票
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