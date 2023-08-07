import { useEffect, useState } from "react";
import { companies as fetchCompanies } from "@/lib/api-agent";
import { Avatar, Container, IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { useRouter } from "next/router";
import ReceiptIcon from '@mui/icons-material/Receipt';

const { default: Layout } = require("@/components/layout")

const page = () => {
  const router = useRouter();
  const {agentId} = router.query;
  const [companies, setCompanies] = useState([]);

  useEffect(()=>{
    fetchCompanies(agentId)
      .then(setCompanies)
      .catch(console.error);
  }, []);
  
  return (
    <Container>

      <List>
        { companies?.length > 0 && companies.map((item) => 
          <ListItem
            key={item.userId}
            secondaryAction={
              <IconButton href={`customers/${item.companies[0]}`}>
                <ReceiptIcon />
              </IconButton>
            }>
            <ListItemAvatar>
              <Avatar src={item.pictureUrl} />
            </ListItemAvatar>
            <ListItemText 
              primary={item.displayName} 
              secondary={item.companies[0]}
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