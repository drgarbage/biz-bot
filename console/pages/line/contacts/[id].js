import { 
  Container, Grid, Stack, TextField,
  Card, CardHeader, CardContent, 
} from "@mui/material";

export default () => {

  return (
    <Container>

      <Grid container>

        <Grid item xs={12} md={6} lg={4} marginTop={2}>
      
          <Card fullWidth>
            <CardHeader 
              title="公司資料" 
              subheader="客戶公司資料"
              />
            <CardContent>

              <Stack gap={2}>

                <TextField 
                  fullWidth
                  size="small"
                  label="統一編號"
                  placeholder="請輸入貴公司統一編號"
                  />

                <TextField 
                  fullWidth
                  size="small"
                  label="公司名稱"
                  placeholder="請輸入貴公司名稱"
                  />

                <TextField 
                  fullWidth
                  size="small"
                  label="公司登記地址"
                  placeholder="請輸入貴公司登記的地址"
                  />

                <TextField 
                  fullWidth
                  size="small"
                  label="聯絡電話"
                  placeholder="請輸入貴公司登記的地址"
                  />

              </Stack>

            </CardContent>
          </Card>

        </Grid>

      </Grid>

    </Container>
  );
}