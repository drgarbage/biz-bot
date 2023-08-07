import { useEffect, useState } from "react";
import { invoices as fetchInvoices } from "@/lib/api-company";
import { Avatar, Button, Container, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { useRouter } from "next/router";
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useFormatter, useTranslations } from "next-intl";

const { default: Layout } = require("@/components/layout");

const convertToCSV = (invoices, format) => {
  const CSV_HEADER = [
    'H,發票號碼,發票日期,發票類別,買方統一編號,課稅別,稅率,通關方式註記,原幣金額,匯率,幣別,營業人角色註記,彙開註記,銷售類別,備註,相關號碼,客戶買方編號',
    'H,發票號碼,品名編號,發票品名,相關號碼,單價,單位,數量,單價2,單位2,數量2,單一欄位備註',
  ];
  const CSV_M = 'M,[發票號碼],[發票日期],[發票類別],[買方統一編號],[課稅別],[稅率],[通關方式註記],[原幣金額],[匯率],[幣別],[營業人角色註記],[彙開註記],[銷售類別],[備註],[相關號碼],[客戶買方編號]';
  const CSV_D = 'D,[發票號碼],[品名編號],[發票品名],[相關號碼],[單價],[單位],[數量],[單價2],[單位2],[數量2],[單一欄位備註]';
  const csv = [...CSV_HEADER];
  for(let m = 0; m < invoices.length; m++) {
    let invoice = invoices[m];
    let invoiceNo = 'BN' + String(m).padStart(10, '0'); // todo: use correct invoice number
    csv.push(CSV_M
      .replace('[發票號碼]',invoiceNo)
      .replace('[發票日期]',format.dateTime(invoice.date.toDate(), {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      }))
      .replace('[發票類別]','08')
      .replace('[買方統一編號]',invoice.buyerBAN)
      .replace('[課稅別]',invoice.taxType)
      .replace('[稅率]', 5)
      .replace('[通關方式註記]','')
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
        .replace('[發票號碼]',invoiceNo)
        .replace('[品名編號]','')
        .replace('[發票品名]',item.name)
        .replace('[相關號碼]','')
        .replace('[單價]',item.price)
        .replace('[單位]','')
        .replace('[數量]',item.quantity)
        .replace('[單價2]','')
        .replace('[單位2]','')
        .replace('[數量2]','')
        .replace('[單一欄位備註]','')
      )
    }
  }
  return csv.join('\n');
}

const page = () => {
  const t = useTranslations()
  const format = useFormatter();
  const router = useRouter();
  const {agentId, customerId} = router.query;
  const [invoices, setInvoices] = useState([]);

  useEffect(()=>{
    fetchInvoices({sellerBAN: customerId})
      .then(setInvoices)
      .catch(console.error);
  }, []);

  const downloadCSV = () => {
    const csvData = convertToCSV(invoices, format);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return (
    <Container>

      <Button onClick={downloadCSV}>下載CSV</Button>

      <List>
        { invoices?.length > 0 && invoices.map((invoice) => 
          <ListItem
            key={invoice.id}
            secondaryAction={
              <IconButton href={`customers/${invoice?.id}`}>
                <ReceiptIcon />
              </IconButton>
            }>
            <ListItemAvatar>
              <Avatar>
                <ReceiptIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={invoice?.buyerName} 
              secondary={invoice?.buyerBAN}
              />
          </ListItem>
        )}
      </List>

    </Container>
  );
}

page.getLayout = (page) =>
  <Layout>{page}</Layout>

export default page;