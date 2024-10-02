import { Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import CameraIcon from "@mui/icons-material/Camera";

function Header() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <CameraIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          여의샛강생태공원 관리자
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            홈
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
