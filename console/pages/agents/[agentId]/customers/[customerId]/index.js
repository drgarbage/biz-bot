import { useEffect, useState } from "react";
import { companyInfo, invoices as fetchInvoices } from "@/lib/api-company";
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button, Container, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Paper, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { useFormatter } from "next-intl";
import { InvoiceView } from "@/components/view-invoice";
import ReceiptIcon from '@mui/icons-material/Receipt';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import moment from "moment";

const { default: Layout } = require("@/components/layout");

const convertSingleToCSV = (invoices, format) => {
  const CSV_HEADER = 'H,[賣方統一編號],[賣方公司名稱],[賣方公司地址],[賣方公司電話]';
  const CSV_M = 'M,[發票號碼],[發票日期],[發票類別],[買方統一編號],[買方公司名稱],[買方公司地址],[課稅別],[稅率],[銷售額合計],[營業稅額],[總計],[通關方式註記],[買受人簽署適用零稅率註記],[總備註]';
  const CSV_D = 'D,[發票品名],[數量],[單價],[金額],[單一欄位備註]';
  const csv = [];

  csv.push(CSV_HEADER
    .replace('[賣方統一編號]',invoices[0].sellerBAN || '')
    .replace('[賣方公司名稱]',invoices[0].sellerName || '')
    .replace('[賣方公司地址]',invoices[0].sellerAddress || '')
    .replace('[賣方公司電話]',invoices[0].sellerPhone || '')
  )

  for(let m = 0; m < invoices.length; m++) {
    let invoice = invoices[m];
    csv.push(CSV_M
      .replace('[發票號碼]',invoice.invoiceId || '')
      .replace('[發票日期]',format.dateTime(invoice.date.toDate(), {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      }))
      .replace('[發票類別]','08')
      .replace('[買方統一編號]',invoice.buyerBAN || '')
      .replace('[買方公司名稱]',invoice.buyerName || '')
      .replace('[買方公司地址]',invoice.buyerAddress || '')
      .replace('[課稅別]',invoice.taxType || '')
      .replace('[稅率]', 5)
      .replace('[銷售額合計]', invoice.total || '')
      .replace('[營業稅額]', invoice.tax || '')
      .replace('[總計]', invoice.amount || '')
      .replace('[通關方式註記]','')
      .replace('[買受人簽署適用零稅率註記]','')
      .replace('[總備註]','')
      .replace('[原幣金額]','')
      .replace('[匯率]','')
      .replace('[幣別]','')
      .replace('[營業人角色註記]','')
      .replace('[彙開註記]','')
      .replace('[銷售類別]',0)
      .replace('[備註]','')
      .replace('[相關號碼]','')
      .replace('[客戶買方編號]','')
    )
  
    for(let d = 0; d < invoice.items.length; d++) {
      let item = invoice.items[d];
      csv.push(CSV_D
        .replace('[發票號碼]',invoice.invoiceId || '')
        .replace('[品名編號]','')
        .replace('[發票品名]',item.name || '')
        .replace('[相關號碼]','')
        .replace('[單價]',item.price || '')
        .replace('[單位]','')
        .replace('[數量]',item.quantity || '')
        .replace('[單價2]','')
        .replace('[單位2]','')
        .replace('[數量2]','')
        .replace('[金額]', item.amount || item.price * item.quantity || '')
        .replace('[單一欄位備註]','')
      )
    }
  }
  return csv.join('\n');
}

// const convertBatchToCSV = (invoices, format) => {
//   const CSV_HEADER = [
//     'H,發票號碼,發票日期,發票類別,買方統一編號,課稅別,稅率,通關方式註記,原幣金額,匯率,幣別,營業人角色註記,彙開註記,銷售類別,備註,相關號碼,客戶買方編號',
//     'H,發票號碼,品名編號,發票品名,相關號碼,單價,單位,數量,單價2,單位2,數量2,單一欄位備註',
//   ];
//   const CSV_M = 'M,[發票號碼],[發票日期],[發票類別],[買方統一編號],[課稅別],[稅率],[通關方式註記],[原幣金額],[匯率],[幣別],[營業人角色註記],[彙開註記],[銷售類別],[備註],[相關號碼],[客戶買方編號]';
//   const CSV_D = 'D,[發票號碼],[品名編號],[發票品名],[相關號碼],[單價],[單位],[數量],[單價2],[單位2],[數量2],[單一欄位備註]';
//   const csv = [...CSV_HEADER];
//   for(let m = 0; m < invoices.length; m++) {
//     let invoice = invoices[m];
//     csv.push(CSV_M
//       .replace('[發票號碼]',invoice.invoiceId || '')
//       .replace('[發票日期]',format.dateTime(invoice.date.toDate(), {
//         year: 'numeric',
//         month: 'numeric',
//         day: 'numeric'
//       }))
//       .replace('[發票類別]','08')
//       .replace('[買方統一編號]',invoice.buyerBAN || '')
//       .replace('[課稅別]',invoice.taxType || '')
//       .replace('[稅率]', 5)
//       .replace('[通關方式註記]','')
//       .replace('[原幣金額]','')
//       .replace('[匯率]','')
//       .replace('[幣別]','')
//       .replace('[營業人角色註記]','')
//       .replace('[彙開註記]','')
//       .replace('[銷售類別]',0)
//       .replace('[備註]','')
//       .replace('[相關號碼]','')
//       .replace('[客戶買方編號]','')
//     )

//     for(let d = 0; d < invoice.items.length; d++) {
//       let item = invoice.items[d];
//       csv.push(CSV_D
//         .replace('[發票號碼]',invoice.invoiceId || '')
//         .replace('[品名編號]','')
//         .replace('[發票品名]',item.name || '')
//         .replace('[相關號碼]','')
//         .replace('[單價]',item.price || '')
//         .replace('[單位]','')
//         .replace('[數量]',item.quantity || '')
//         .replace('[單價2]','')
//         .replace('[單位2]','')
//         .replace('[數量2]','')
//         .replace('[單一欄位備註]','')
//       )
//     }
//   }
//   return csv.join('\n');
// }

const page = () => {
  const format = useFormatter();
  const router = useRouter();
  const {agentId, customerId} = router.query;
  const [invoices, setInvoices] = useState([]);
  const [seller, setSeller] = useState();

  useEffect(()=>{
    if(!customerId) return;
    fetchInvoices({sellerBAN: customerId})
      .then(setInvoices)
      .catch(console.error);
    companyInfo(customerId)
      .then(setSeller)
      .catch(console.error);
  }, [customerId, setInvoices, setSeller]);

  const downloadBatchCSV = () => {
    const first = invoices[0];
    const last = invoices[invoices.length-1];
    const csvData = convertSingleToCSV(invoices, format);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${first.sellerBAN}存證開立發票-${first.invoiceId}-${last.invoiceId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const downloadSingleCSV = (index) => {
    const invoice = invoices[index];
    const csvData = convertSingleToCSV([invoice], format);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.sellerBAN}存證開立發票-${invoice.buyerBAN}-${invoice.invoiceId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return (
    <Container>

      <Box m={2} display="flex" flexDirection="column" alignItems="center">
        <Avatar sx={{m:1, width: 72, height: 72}}>
          <CorporateFareIcon fontSize="large" />
        </Avatar>
        <strong>{seller?.companyName}</strong>
        <label>{customerId}</label>
      </Box>

      <Paper sx={{m: 2, p: 1}}>
        <IconButton onClick={downloadBatchCSV}>
          <ReceiptIcon />
        </IconButton>
        <Button onClick={downloadBatchCSV}>
          下載CSV
        </Button>
      </Paper>

      <List>
        { invoices?.length > 0 && invoices.map((invoice, index) => 
          <ListItem >

            <Accordion sx={{flex:1}}>
              <AccordionSummary>

                <ListItemAvatar>
                  <Avatar>
                    {index+1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>
                  <Box display="flex" flexDirection="column">
                    <strong style={{fontSize: '24px'}}>{`$ ${format.number(invoice?.amount)}`}</strong>
                    <small>{invoice?.invoiceId}</small>
                    <small>{invoice?.buyerName}</small>
                    <small>{moment(invoice?.date.toDate()).format('yyyy/MM/DD')}</small>
                  </Box>
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={e => {
                      e.preventDefault();
                      downloadSingleCSV(index);
                    }}>
                    <ReceiptIcon />
                  </IconButton>
                </ListItemSecondaryAction>

              </AccordionSummary>

              <AccordionDetails>
                <InvoiceView invoice={invoice} />
              </AccordionDetails>
            </Accordion>


          </ListItem>
        )}
      </List>

    </Container>
  );
}

page.getLayout = (page) =>
  <Layout>{page}</Layout>

export default page;