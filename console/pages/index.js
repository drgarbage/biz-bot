import { Avatar, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Container, Grid, Typography } from "@mui/material"

export default () => {
  return (
    <Container sx={{flex:1, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6} lg={4} flex={1}>
          <Card>
            <CardMedia 
              component="img"
              height={320}
              image="/images/banner.png" 
              />
            <CardHeader 
              avatar={
                <Avatar src="/images/girl.png" />
              }
              title="會計小幫手" 
              subheader="歡迎加入會計小幫手LINE官方帳號"
              />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};