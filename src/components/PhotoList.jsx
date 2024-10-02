/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import "./PhotoList.css";

function PhotoList({ photos }) {
  return (
    <div className="photo-list">
      {photos.map((photo) => (
        <Link to={`/photo/${photo.id}`} key={photo.id} className="photo-card">
          <img
            src={photo.photos[0].url}
            alt={photo.name}
            className="photo-thumbnail"
          />
          <div className="photo-list-info">
            <h3>{photo.name}</h3>
            <p>업로드: {photo.timestamp.toDate().toLocaleString()}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default PhotoList;
