/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import { Typography, Paper } from "@mui/material";
import {
  GoogleMap,
  useJsApiLoader,
  HeatmapLayer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 37.5186837,
  lng: 126.9219841,
};

const HeatmapCard = ({ trails }) => {
  const [heatmapData, setHeatmapData] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["visualization"],
  });

  const [, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  useEffect(() => {
    if (isLoaded && trails.length > 0) {
      generateHeatmapData(trails);
    }
  }, [isLoaded, trails]);

  const generateHeatmapData = (trailList) => {
    if (window.google && window.google.maps) {
      const heatmapPoints = trailList.flatMap((trail) =>
        trail.path.map(
          (point) => new window.google.maps.LatLng(point._lat, point._long)
        )
      );
      setHeatmapData(heatmapPoints);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        산책로 히트맵
      </Typography>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={17}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {heatmapData.length > 0 && (
            <HeatmapLayer
              data={heatmapData}
              options={{
                radius: 15,
                opacity: 0.6,
              }}
            />
          )}
        </GoogleMap>
      ) : (
        <Typography>Loading map...</Typography>
      )}
    </Paper>
  );
};

export default HeatmapCard;
