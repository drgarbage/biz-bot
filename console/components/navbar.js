import { AppBar, IconButton, Toolbar, Typography, Button, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          小幫手
        </Typography>
        <Button color="inherit">
          <Avatar />
        </Button>
      </Toolbar>
    </AppBar>
  );
}