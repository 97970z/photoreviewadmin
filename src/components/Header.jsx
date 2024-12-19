import { AppBar, Toolbar, Typography } from "@mui/material";
import CameraIcon from "@mui/icons-material/Camera";

function Header() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <CameraIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          여의샛강생태공원
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
