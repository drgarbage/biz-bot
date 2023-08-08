import { useEffect, useState } from "react";
import { companies as fetchCompanies } from "@/lib/api-agent";
import { Container, List, ListItem, ListItemText } from "@mui/material";

const { default: Layout } = require("@/components/layout")

const page = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(()=>{
    fetchCompanies('')
      .then(setCompanies)
      .catch(console.error);
  }, []);
  
  return (
    <Container>

      <List>
      { companies.map((item) => 
          <ListItem>
            <ListItemText>{item.companyName}</ListItemText>
          </ListItem>
      )}
      </List>

    </Container>
  );
}

page.getLayout = (page) =>
  <Layout>{page}</Layout>

export default page;