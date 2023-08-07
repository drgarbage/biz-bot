import { 
  Box, Stack, Button, Divider,
  Card, CardContent, CardHeader,
} from "@mui/material";

export const InvoiceView = ({invoice}) =>
  <Card>
    <CardHeader 
      title={invoice?.amount} 
      subheader={invoice?.buyerName} 
      />
    <CardContent>
      
      <Stack gap={1} mt={2}>

        <label>{invoice?.date?.toDate().toDateString() || ''}</label>

        <labrel>開立人</labrel>
        <label>{invoice?.sellerBAN || ''}</label>
        <label>{invoice?.sellerName || ''}</label>
        <label>{invoice?.sellerAddress || ''}</label>

        <Divider />

        <labrel>買受人</labrel>
        <label>{invoice?.buyerBAN || ''}</label>
        <label>{invoice?.buyerName || ''}</label>
        <label>{invoice?.buyerAddress || ''}</label>

        <Divider />

        { !!invoice?.items && invoice.items.length > 0 &&
          invoice.items.map((item, index) =>
            <Box key={index}>
              <Stack gap={1} direction="row">
                <label>{index+1}</label>
                <label>{item?.name}</label>
                <label>{item?.price}</label>
                <label>{item?.quantity}</label>
                <label>{item?.amount}</label>
              </Stack>
            </Box>
          )
        }

        <Divider />

        <label>{`小計 ${invoice?.subtotal || ''}`}</label>
        <label>{`營業稅 ${invoice?.tax || ''}`}</label>
        <label>{`總計 ${invoice?.amount || ''}`}</label>

      </Stack>

    </CardContent>
  </Card>