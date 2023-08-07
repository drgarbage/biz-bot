import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useLineContext } from "@/context/line-context";
import { invoice as fetchInvoice } from "@/lib/api-company";
import { 
  Box, Container, Stack, 
  Button, Divider, 
} from "@mui/material";
import LineLayout from '@/components/layout-line';
import Head from "next/head";
import liff from "@line/liff";
import { InvoiceView } from "@/components/view-invoice";

const page = () => {
  const router = useRouter();
  const { id: invoiceId } = router.query;
  const { profile } = useLineContext();
  const [invoice, setInvoice] = useState();

  useEffect(() => {
    if(!invoiceId) return;
    fetchInvoice(invoiceId)
      .then(setInvoice)
      .catch(console.error);
  }, [invoiceId, setInvoice]);

  const total = !!invoice?.items ? 
    invoice.items.reduce((pre, cur)=> pre + parseFloat(cur.subtotal), 0):
    0;

  return (
    <Container>
      
      <Head>
        <title>檢視發票</title>
      </Head>

      <InvoiceView invoice={invoice} />

      <Button 
        fullWidth
        variant="contained"
        onClick={()=>liff.closeWindow()}
      >
        確定
      </Button>

    </Container>
  );
}

page.getLayout = (page) =>
  <LineLayout>
    {page}
  </LineLayout>

export default page;