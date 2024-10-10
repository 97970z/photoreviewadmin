/* eslint-disable react/prop-types */
import { Box, Button, Tooltip } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Link } from "react-router-dom";

const PhotoNavigation = ({ prevId, nextId }) => {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "space-between", mt: 4, mb: 2 }}
    >
      <Tooltip title={prevId ? "이전 사진" : "이전 사진 없음"}>
        <span>
          <Button
            component={Link}
            to={prevId ? `/photo/${prevId}` : "#"}
            disabled={!prevId}
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            이전
          </Button>
        </span>
      </Tooltip>
      <Tooltip title={nextId ? "다음 사진" : "다음 사진 없음"}>
        <span>
          <Button
            component={Link}
            to={nextId ? `/photo/${nextId}` : "#"}
            disabled={!nextId}
            endIcon={<ArrowForward />}
            variant="outlined"
            sx={{
              borderColor: "transparent",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            다음
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};

export default PhotoNavigation;
