import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CameraIcon from "@mui/icons-material/Camera";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db, deletePhotoAndData } from "../services/firebase";
import { exportReviewedDataToExcel } from "../utils/excelExport";

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteUnreviewedOpen = () => {
    setIsDeleteDialogOpen(true);
    handleClose();
  };

  const handleDeleteUnreviewedClose = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteUnreviewed = async () => {
    try {
      const q = query(
        collection(db, "photos"),
        where("isReviewed", "==", false)
      );
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      const deletePromises = querySnapshot.docs.map(async (doc) => {
        const photoData = doc.data();
        const photoUrls = photoData.photos.map((p) => p.url);
        await deletePhotoAndData(doc.id, photoUrls);
      });

      await Promise.all(deletePromises);
      await batch.commit();

      console.log("모든 미검토 데이터가 삭제되었습니다.");
      handleDeleteUnreviewedClose();
    } catch (error) {
      console.error("미검토 데이터 삭제 중 오류 발생:", error);
    }
  };

  const handleExportToExcel = () => {
    exportReviewedDataToExcel();
    handleClose();
  };

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
          <Button color="inherit" component={RouterLink} to="/trails">
            산책로
          </Button>
          <Button color="inherit" onClick={handleClick}>
            메뉴
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleDeleteUnreviewedOpen}>
              미검토 데이터 일괄 삭제
            </MenuItem>
            <MenuItem onClick={handleExportToExcel}>
              검토 완료 데이터 엑셀 다운로드
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <Dialog open={isDeleteDialogOpen} onClose={handleDeleteUnreviewedClose}>
        <DialogTitle>미검토 데이터 일괄 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            모든 미검토 데이터를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteUnreviewedClose}>취소</Button>
          <Button onClick={handleDeleteUnreviewed} color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}

export default Header;
