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
}) {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isCancelReviewDialogOpen, setIsCancelReviewDialogOpen] =
    useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
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
  }, [photo.photos]);

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
    onReview();
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
        <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
          {photo.isReviewed ? (
            <Button
              onClick={handleCancelReviewClick}
              variant="contained"
              color="secondary"
            >
              검토 취소
            </Button>
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
      </div>
      <div
        className="photo-slider"
        style={{ aspectRatio: "16/9", position: "relative" }}
      >
        {!imagesLoaded && (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        )}
        <Slider
          {...settings}
          ref={sliderRef}
          style={{ opacity: imagesLoaded ? 1 : 0, transition: "opacity 0.3s" }}
        >
          {photo.photos.map((p, index) => (
            <div key={index} style={{ aspectRatio: "16/9" }}>
              <img
                src={p.url}
                alt={`Photo ${index + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* ... (Dialog components remain unchanged) ... */}
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
    </div>
  );
}

export default PhotoDetail;
