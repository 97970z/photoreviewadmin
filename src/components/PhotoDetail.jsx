/* eslint-disable react/prop-types */
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./PhotoDetail.css";

function PhotoDetail({ photo, onReview }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <div className="photo-detail">
      <h2>{photo.name}</h2>
      <div className="photo-info">
        <p>
          <strong>업로드 일시:</strong>{" "}
          {photo.timestamp.toDate().toLocaleString()}
        </p>
        <p>
          <strong>위치:</strong> 위도 {photo.photos[0].latitude}, 경도{" "}
          {photo.photos[0].longitude}
        </p>
        <p>
          <strong>검토 상태:</strong> {photo.isReviewed ? "검토완료" : "미검토"}
        </p>
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
      {!photo.isReviewed && (
        <button onClick={onReview} className="review-button">
          검토 완료
        </button>
      )}
    </div>
  );
}

export default PhotoDetail;
