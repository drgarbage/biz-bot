import { 
  Box, Container, Grid, Stack, TextField,
  Card, CardHeader, CardContent, ListItem, List, ListItemText, ListItemButton, Button, Toolbar, Input, AppBar,
} from "@mui/material";

export default () => {
  const companies = [
    {id: '24112900', name: 'COMPANY1' },
    {id: '48921137', name: 'COMPANY2' },
    {id: '38364532', name: 'COMPANY3' },
  ];

  return (
    <Container disableGutters>
      
      <Toolbar>
        <TextField size="small" />
        <Button>新增</Button>
      </Toolbar>

      <List>
      {
        companies.map((item) => 
          <ListItem>
            <ListItemButton>
              <ListItemText 
                primary={item.name} 
                secondary={item.id}
                />
            </ListItemButton>
          </ListItem>
        )
      }
      </List>

    </Container>
  );
}