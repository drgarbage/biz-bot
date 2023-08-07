import { Button, Card, CardActions, CardContent, CardHeader, Container, Grid, Typography } from "@mui/material"

export default () => {
  return (
    <Container sx={{flex:1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6} lg={4} flex={1}>
          <Card>
            <CardHeader title="Biz Bot" />
            <CardContent>
              <Typography>
                This is a line application for small bisiness.
              </Typography>
            </CardContent>
            <CardActions>
              <Button fullWidth variant="contained">Config</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};