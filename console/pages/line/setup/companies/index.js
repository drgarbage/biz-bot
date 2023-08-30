import { useState } from "react";
import { useLineContext } from "@/context/line-context";
import { useRouter } from "next/router";
import { Avatar, Box, Button, Container, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemSecondaryAction, Stack, Switch } from "@mui/material";
import LineLayout from '@/components/layout-line';
import BANField from '@/components/view-ban';
import BANProfile from '@/components/view-ban-profile';

import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';


const Section = ({children}) =>
  <Box sx={{
    textAlign: 'center', 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: 'gray'
  }}>{children}</Box>

const page = () => {
  const router = useRouter();
  const { profile, addCompany, removeCompany, setDefaultCompany } = useLineContext();
  const [ newCompanyBAN, setNewCompanyBAN ] = useState('');
  const [ editMode, setEditMode ] = useState(false);

  const handleAddCompany = async () => {
    await addCompany(newCompanyBAN);
    setNewCompanyBAN('');
  }
  
  return (
    <Container>

      <Stack direction="column" mt={2} gap={2}>

        {!!profile &&

          <Stack direction="row" gap={1} alignItems="center">
            <Avatar 
              sx={{width:24,height:24}}
              alt={profile?.displayName} 
              src={profile?.pictureUrl} 
              />
            <small>{profile?.displayName}</small>
            <Box sx={{flex:1}}>&nbsp;</Box>
            <Switch checked={editMode} onChange={e => setEditMode(e.target.checked)} color="error" />
          </Stack>

        }

        {!!profile &&
          <Divider />
        }

        <Section>公司列表</Section>

        <List>

          {!!profile && profile.companies.map((companyBAN, index) => 
            <ListItem key={companyBAN}>
              { editMode && 
                <>
                  <ListItemAvatar>
                    <Avatar sx={{bgcolor: index !== 0 ? 'silver' : 'red'}}>
                      { index === 0 && <AssignmentTurnedInIcon />}
                      { index !== 0 && <AssignmentIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <BANProfile 
                    fullWidth
                    size="small"
                    label="統一編號"
                    placeholder="請輸入貴公司統一編號"
                    companyBAN={companyBAN}
                    />
                  <ListItemSecondaryAction>
                    
                    <IconButton onClick={() => removeCompany(companyBAN)}>
                      <HighlightOffIcon color="error" />
                    </IconButton>

                    {index !== 0 &&
                      <IconButton onClick={() => setDefaultCompany(companyBAN)}>
                        <VerticalAlignTopIcon />
                      </IconButton>
                    }

                  </ListItemSecondaryAction>
                </>
              }

              { !editMode &&
                <ListItemButton onClick={ () => router.push(`/line/setup/companies/${companyBAN}`)}>
                  <ListItemAvatar>
                    <Avatar sx={{bgcolor: index !== 0 ? 'silver' : 'red'}}>
                      { index === 0 && <AssignmentTurnedInIcon />}
                      { index !== 0 && <AssignmentIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <BANProfile 
                    fullWidth
                    size="small"
                    label="統一編號"
                    placeholder="請輸入貴公司統一編號"
                    companyBAN={companyBAN}
                    />
                  <ListItemSecondaryAction>
                    <NavigateNextIcon />
                  </ListItemSecondaryAction>
                </ListItemButton>
              }
            </ListItem>
          )}

          <ListItem>
            <BANField 
              fullWidth
              size="small"
              label="統一編號"
              placeholder="請輸入貴公司統一編號"
              value={newCompanyBAN}
              onChange={e => setNewCompanyBAN(e.target.value)}
              />
            <Button onClick={handleAddCompany}>加入</Button>
          </ListItem>
        </List>

      </Stack>

    </Container>
  );
}

page.getLayout = (page) =>
  <LineLayout>
    {page}
  </LineLayout>

export default page;