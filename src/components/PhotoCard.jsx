/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardContent,
  // CardMedia,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.15s ease-in-out",
  "&:hover": { transform: "scale3d(1.05, 1.05, 1)" },
  boxShadow: theme.shadows[3],
}));

const PhotoCard = React.memo(({ photo, categoryMap }) => {
  const categoryLabel = categoryMap[photo.category] || "기타";
  const title = `[${categoryLabel}] ${photo.name}`;

  return (
    <CardActionArea component={Link} to={`/photo/${photo.id}`}>
      <StyledCard>
        {/* <CardMedia
          component="img"
          height="200"
          image={photo.photos[0].url}
          alt={title}
        /> */}
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            업로드: {photo.timestamp.toDate().toLocaleString()}
          </Typography>
        </CardContent>
      </StyledCard>
    </CardActionArea>
  );
});

export default PhotoCard;
