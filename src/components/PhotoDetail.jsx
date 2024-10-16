/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  TextField,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import PhotoNavigation from "./PhotoNavigation";
import "./PhotoDetail.css";

const categoryMap = {
  amphibian: "양서류",
  plant: "식물",
  benthicOrganism: "저서생물",
  insect: "곤충",
  bird: "조류",
  mammal: "포유류",
};

function PhotoDetail({
  photo,
  prevId,
  nextId,
  onReview,
  onCancelReview,
  onDelete,
  onUpdateInfo,
  onRemovePhoto,
}) {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isCancelReviewDialogOpen, setIsCancelReviewDialogOpen] =
    useState(false);
  const [isRemovePhotoDialogOpen, setIsRemovePhotoDialogOpen] = useState(false);
  const [removingPhotoIndex, setRemovingPhotoIndex] = useState("");
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState(
    photo.additionalInfo || ""
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const sliderRef = useRef(null);

  useEffect(() => {
    const imagePromises = photo.photos.map((p) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.src = p.url;
      });
    });

    Promise.all(imagePromises).then(() => {
      setImagesLoaded(true);
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(0);
      }
    });

    setAdditionalInfo(photo.additionalInfo || "");
    setRemovingPhotoIndex("");
  }, [photo]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  const categoryLabel = categoryMap[photo.category] || "기타";
  const title = `[${categoryLabel}] ${photo.name}`;

  const handleReviewClick = () => {
    setIsReviewDialogOpen(true);
  };

  const handleReviewConfirm = () => {
    setIsReviewDialogOpen(false);
    onReview(additionalInfo);
  };

  const handleReviewCancel = () => {
    setIsReviewDialogOpen(false);
  };

  const handleCancelReviewClick = () => {
    setIsCancelReviewDialogOpen(true);
  };

  const handleCancelReviewConfirm = () => {
    setIsCancelReviewDialogOpen(false);
    onCancelReview();
  };

  const handleCancelReviewCancel = () => {
    setIsCancelReviewDialogOpen(false);
  };

  const handleAdditionalInfoChange = (event) => {
    setAdditionalInfo(event.target.value);
  };

  const handleUpdateInfo = async () => {
    const success = await onUpdateInfo(additionalInfo);
    if (success) {
      setSnackbarMessage("정보가 성공적으로 업데이트되었습니다!");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleRemovePhotoChange = (event) => {
    setRemovingPhotoIndex(event.target.value);
  };

  const handleRemovePhotoClick = () => {
    if (removingPhotoIndex !== "") {
      setIsRemovePhotoDialogOpen(true);
    }
  };

  const handleRemovePhotoConfirm = async () => {
    setIsRemovePhotoDialogOpen(false);
    const success = await onRemovePhoto(parseInt(removingPhotoIndex));
    if (success) {
      setSnackbarMessage("사진이 성공적으로 제거되었습니다!");
      setSnackbarOpen(true);
      setRemovingPhotoIndex("");
    }
  };

  const handleRemovePhotoCancel = () => {
    setIsRemovePhotoDialogOpen(false);
  };

  return (
    <div className="photo-detail">
      <PhotoNavigation prevId={prevId} nextId={nextId} />

      <hr />
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      <div className="photo-info">
        <Typography>
          <strong>업로드 일시:</strong>{" "}
          {photo.timestamp.toDate().toLocaleString()}
        </Typography>
        <Typography>
          <strong>위치:</strong> 위도 {photo.photos[0].latitude}, 경도{" "}
          {photo.photos[0].longitude}
        </Typography>
        <Typography>
          <strong>카테고리:</strong> {categoryLabel}
        </Typography>
        <Typography>
          <strong>검토 상태:</strong> {photo.isReviewed ? "검토완료" : "미검토"}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="추가 정보"
            multiline
            rows={4}
            fullWidth
            value={additionalInfo}
            onChange={handleAdditionalInfoChange}
            disabled={!photo.isReviewed}
          />
        </Box>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {photo.isReviewed ? (
            <>
              <Button
                onClick={handleCancelReviewClick}
                variant="contained"
                color="secondary"
              >
                검토 취소
              </Button>
              <Button
                onClick={handleUpdateInfo}
                variant="contained"
                color="primary"
                disabled={additionalInfo === photo.additionalInfo}
              >
                정보 업데이트
              </Button>
            </>
          ) : (
            <Button
              onClick={handleReviewClick}
              variant="contained"
              color="primary"
            >
              검토 완료
            </Button>
          )}
          <Button onClick={onDelete} variant="contained" color="error">
            삭제
          </Button>
        </Box>
        {photo.photos.length > 1 && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="remove-photo-select-label">
                제거할 사진 선택
              </InputLabel>
              <Select
                labelId="remove-photo-select-label"
                value={removingPhotoIndex}
                label="제거할 사진 선택"
                onChange={handleRemovePhotoChange}
              >
                {photo.photos.map((p, index) => (
                  <MenuItem key={index} value={index}>
                    사진 {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              onClick={handleRemovePhotoClick}
              variant="contained"
              color="error"
              disabled={removingPhotoIndex === ""}
            >
              선택한 사진 제거
            </Button>
          </Box>
        )}
      </div>
      <div className="photo-slider" style={{ marginTop: "20px" }}>
        {!imagesLoaded ? (
          <Skeleton variant="rectangular" width="100%" height={400} />
        ) : (
          <Slider {...settings} ref={sliderRef}>
            {photo.photos.map((p, index) => (
              <div key={index}>
                <img
                  src={p.url}
                  alt={`Photo ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </Slider>
        )}
      </div>

      <Dialog open={isReviewDialogOpen} onClose={handleReviewCancel}>
        <DialogTitle>검토 완료 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 사진의 검토를 완료하시겠습니까? 이 작업은 취소할 수 있습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReviewCancel}>취소</Button>
          <Button onClick={handleReviewConfirm} color="primary">
            확인
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isCancelReviewDialogOpen}
        onClose={handleCancelReviewCancel}
      >
        <DialogTitle>검토 취소 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 사진의 검토를 취소하시겠습니까? 이 작업은 다시 되돌릴 수
            있습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReviewCancel}>취소</Button>
          <Button onClick={handleCancelReviewConfirm} color="secondary">
            확인
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isRemovePhotoDialogOpen} onClose={handleRemovePhotoCancel}>
        <DialogTitle>사진 제거 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            선택한 사진을 정말로 제거하시겠습니까? 이 작업은 취소할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemovePhotoCancel}>취소</Button>
          <Button onClick={handleRemovePhotoConfirm} color="error">
            제거
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default PhotoDetail;
