import { useEffect, useState } from "react";
import { companies as fetchCompanies } from "@/lib/api-agent";
import { Container, List, ListItem, ListItemText } from "@mui/material";
import { useRouter } from "next/router";
import { invoices as fetchInvoices } from "@/lib/api-company";

const { default: Layout } = require("@/components/layout")

const page = () => {
  const router = useRouter();
  const { customerBAN } = router.query;
  const [invoices, setInvoices] = useState([]);

  useEffect(()=>{
    fetchInvoices({sellerBAN: customerBAN})
      .then(setInvoices)
      .catch(console.error);
  }, []);
  
  return (
    <Container>

      <List>
      {invoices.map((item) => 
        <ListItem key={item.id}>
          <ListItemText>{item.buyerBAN}</ListItemText>
        </ListItem>
      )}
      </List>

    </Container>
  );
}

page.getLayout = (page) =>
  <Layout>{page}</Layout>

export default page;