import { 
  Box, Stack, Button, Divider,
  Card, CardContent, CardHeader,
} from "@mui/material";
import { useFormatter, useTranslations } from "next-intl";

export const InvoiceView = (props) =>{
  const {invoice} = props;
  const format = useFormatter();
  
  return (
    <Card {...props}>
      <CardHeader 
        title={invoice?.buyerName} 
        subheader={
          <Box>
            <Box sx={{display: 'flex', flexDirection: 'row', color: 'gray'}}>
              <lavbel style={{flex:1}}>統一編號</lavbel>
              <lavbel style={{flex:2}}>{invoice?.buyerBAN}</lavbel>
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'row', color: 'gray'}}>
              <lavbel style={{flex:1}}>發票日期</lavbel>
              <lavbel style={{flex:2}}>{format.dateTime(invoice?.date?.toDate(), {year: 'numeric', month: 'numeric', day: 'numeric'})}</lavbel>
            </Box>
          </Box>
        }/>
      <CardContent>
        
        <Stack gap={1} mt={2}>

          { !!invoice?.items && invoice.items.length > 0 &&
            invoice.items.map((item, index) =>
              <Box key={index} sx={{display: 'flex', flexDirection: 'row'}}>
                <label style={{flex:1}}>{item?.name}</label>
                <label style={{textAlign: 'right'}}>{item?.quantity}</label>
                <label style={{flex:1, textAlign: 'right'}}>{format.number(item?.price * item?.quantity)}</label>
              </Box>
            )
          }

          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <label style={{flex:1}}>稅額</label>
            <label style={{flex:1, textAlign: 'right'}}>{format.number(invoice?.tax)}</label>
          </Box>

          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <label style={{flex:1}}>總計</label>
            <label style={{flex:1, textAlign: 'right', fontSize: '32px', color: 'navy'}}>{format.number(invoice?.amount)}</label>
          </Box>

        </Stack>

      </CardContent>
    </Card>
  );
}