/* eslint-disable react/prop-types */
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Typography, Button, Box } from "@mui/material";
import "./PhotoDetail.css";

const categoryMap = {
  amphibian: "양서류",
  plant: "식물",
  benthicOrganism: "저서생물",
  insect: "곤충",
  bird: "조류",
  mammal: "포유류",
};

function PhotoDetail({ photo, onReview, onDelete }) {
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

  return (
    <div className="photo-detail">
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
      </div>
      <div className="photo-slider">
        <Slider {...settings}>
          {photo.photos.map((p, index) => (
            <div key={index}>
              <img src={p.url} alt={`Photo ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </div>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
        {!photo.isReviewed && (
          <Button onClick={onReview} variant="contained" color="primary">
            검토 완료
          </Button>
        )}
        <Button onClick={onDelete} variant="contained" color="error">
          삭제
        </Button>
      </Box>
    </div>
  );
}

export default PhotoDetail;
