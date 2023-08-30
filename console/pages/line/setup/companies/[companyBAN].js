import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLineContext } from "@/context/line-context";
import { appendInvoicePackage, appendInvoicePackagesByCSV, deleteInvoicePackage, invoicePackagesByGroup } from "@/lib/api-company";
import { Avatar, Box, Button, Container, Divider, IconButton, InputAdornment, InputBase, List, ListItem, ListItemIcon, ListItemText, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import LineLayout from '@/components/layout-line';
import BANProfile from '@/components/view-ban-profile';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import moment from "moment";

const createPackage = (monthAdded) => {
  const targetMonth = moment().add(monthAdded, 'months');
  const year = targetMonth.year();
  const chYear = year - 1911;
  const beginMonth = Math.floor(targetMonth.month()/2)*2 + 1;
  const endMonth = beginMonth + 1;
  const begin = String(beginMonth).padStart(2,'0');
  const end = String(endMonth).padStart(2,'0');
  const value = `${year}-${begin}-${end}`;
  const children = `${chYear}/${begin} ~ ${chYear}/${end}`;
  return {
    beginMonth,
    value,
    children
  }
}

const parseGroupName = (group) => {
  const [year, begin, end] = group.split('-');
  const chYear = year - 1911;
  return `${chYear}/${begin} ~ ${chYear}/${end}`;
}

const PackageGroupOptions = [...new Array(6).keys()].map(value => createPackage(value*2 - 2));
const PackageInitial = { prefix: '', begin: '', end: '' };

const Section = ({children}) =>
  <Box sx={{
    textAlign: 'center', 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: 'gray'
  }}>{children}</Box>

const page = () => {
  const defaultGroupBeginMonth = Math.floor(new Date().getMonth() / 2) * 2 + 1; 
  const defaultGroup = PackageGroupOptions.find(v => v.beginMonth == defaultGroupBeginMonth);
  const router = useRouter();
  const { profile } = useLineContext();
  const { companyBAN } = router.query;
  const [invoicePackages, setInvoicePackages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(defaultGroup.value);
  const [newPackage, setNewPackage] = useState(PackageInitial);
  const canAppend =
    newPackage.prefix.length === 2 &&
    newPackage.begin.length === 8 &&
    newPackage.end.length === 8 &&
    parseInt(newPackage.end) - parseInt(newPackage.begin) > 49;

  const reload = async () => {
    if(!companyBAN) return;
    try{
      const results = await invoicePackagesByGroup(companyBAN, selectedGroup);
      setInvoicePackages(results);
    } catch (error) {
      console.error("Error loading packages.", error);
    }
  }

  const handleAppend = async () => {
    try{
      await appendInvoicePackage(companyBAN, {
        ...newPackage,
        group: selectedGroup,
      });
      await reload();
      setNewPackage(PackageInitial);
    } catch (error) {
      console.error("Error adding package.", error);
    }
  }

  const handleRemove = async (id) => {
    try{
      await deleteInvoicePackage(companyBAN, id);
      await reload();
    } catch (error) {
      console.error("Error removing package.", error);
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const csv = event.target.result;
          await appendInvoicePackagesByCSV(companyBAN, csv);
          alert('檔案已上傳！');
          reload();
        };
        reader.readAsText(file);
      } catch (error) { 
        console.error("Error uploading CSV:", error);
      }
    }
  };

  useEffect(() => { reload() },[companyBAN, selectedGroup, setInvoicePackages]);
  

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
          </Stack>

        }

        {!!profile &&
          <Divider />
        }

        <BANProfile companyBAN={companyBAN} />

        <Divider />

        <Section>發票字軌列表</Section>

        <Select 
          value={selectedGroup} 
          startAdornment={
            <InputAdornment position="start">
              發票期別
            </InputAdornment>
          }
          onChange={e => setSelectedGroup(e.target.value)}>
          {
            PackageGroupOptions.map(({beginMonth, value, children}) => 
              <MenuItem 
                key={beginMonth} 
                value={value}
                children={children}
                />
            )
          }
        </Select>

        <Paper>
          <List>
            {invoicePackages.length === 0 && 
              <ListItem>
                <ListItemText>尚未上傳字軌</ListItemText>
              </ListItem>
            }
            
            {invoicePackages.length > 0 && invoicePackages.map(({id, group, begin, end, cursor, prefix, available}) => 
              <ListItem 
                key={id}
                >
                <ListItemIcon>
                  { available && begin === cursor && 
                    <IconButton onClick={() => handleRemove(id)}>
                      <HighlightOffIcon />
                    </IconButton>
                  }
                </ListItemIcon>
                <Divider />
                <ListItemText 
                  primary={parseGroupName(group)}
                  secondary={`${prefix}${begin} ~ ${prefix}${end}`}
                  />
                <ListItemText 
                  primary={
                    [
                      available && begin === cursor ? '未使用' : '',
                      available && begin !== cursor && end !== cursor ? `${parseInt(cursor) - parseInt(begin) + 1}/${parseInt(end) - parseInt(begin) + 1}` : '',
                      !available ? '已用盡' : ''
                    ].join('')
                  }
                  />
              </ListItem>
            )}
          </List>
        </Paper>
        
        <Paper sx={{pl:2}}>
          <Stack direction="row">
            <InputBase 
              sx={{flex:1}}
              inputProps={{maxLength: 2, style: { textAlign: 'center' }}}
              placeholder="XX"
              value={newPackage.prefix} 
              onChange={({target:{value}}) => 
                (/^[a-zA-Z]*$/.test(value) || value === '') &&
                setNewPackage({
                  ...newPackage, 
                  prefix: value.toUpperCase()
                })}
              />
            <InputBase 
              sx={{flex:2}} 
              inputProps={{maxLength: 8, style: { textAlign: 'center' }}}
              placeholder="00000000"
              value={newPackage.begin} 
              onChange={({target:{value}}) => 
                (/^\d*$/.test(value) || value === '') &&
                setNewPackage({
                  ...newPackage, 
                  begin: value
                })}
              />
            <Typography sx={{p:2}}>&nbsp;-&nbsp;</Typography>
            <InputBase 
              sx={{flex:2}} 
              inputProps={{maxLength: 8, style: { textAlign: 'center' }}}
              placeholder="00000000"
              value={newPackage.end}
              onChange={({target:{value}}) => 
                (/^\d*$/.test(value) || value === '') &&
                setNewPackage({
                  ...newPackage, 
                  end: value
                })}
              />
            <Button disabled={!canAppend} onClick={handleAppend}>新增</Button>
          </Stack>
        </Paper>


        <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            id="csvInput"
          />

        <Button 
          fullWidth 
          variant="contained" 
          color="inherit"
          onClick={() => document.getElementById('csvInput').click()}>
            上傳發票字軌檔 (CSV)
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