/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useCallback, useState, memo, useEffect } from "react";
import { GoogleMap, Polyline } from "@react-google-maps/api";
import { Box, Typography } from "@mui/material";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "400px",
};

const center = {
  lat: 37.5186837,
  lng: 126.9219841,
};

const TrailMap = memo(({ isLoaded, trails, mapKey }) => {
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const onLoad = useCallback((map) => {
    setMap(map);
    setMapLoaded(true);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setMapLoaded(false);
  }, []);

  useEffect(() => {
    if (mapLoaded && map) {
      const bounds = new window.google.maps.LatLngBounds();
      trails?.forEach((trail) => {
        if (Array.isArray(trail.path)) {
          trail.path.forEach((coord) => {
            if (coord?._lat && coord?._long) {
              bounds.extend({ lat: coord._lat, lng: coord._long });
            }
          });
        }
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    }
  }, [mapLoaded, map, trails]);

  const parseCoordinates = useCallback((coord) => {
    if (!coord) return null;
    if (typeof coord === "object" && "_lat" in coord && "_long" in coord) {
      return { lat: coord._lat, lng: coord._long };
    }
    return null;
  }, []);

  if (!isLoaded) return <Typography>Loading map...</Typography>;

  return (
    <Box sx={{ flexGrow: 1, p: 1 }} key={mapKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={17}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          gestureHandling: "greedy",
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {mapLoaded &&
          trails?.map((trail) => {
            const path = Array.isArray(trail.path)
              ? trail.path.map(parseCoordinates).filter(Boolean)
              : [];

            return path.length > 0 ? (
              <Polyline
                key={trail.id}
                path={path}
                options={{
                  strokeColor: "#FF0000",
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                }}
              />
            ) : null;
          })}
      </GoogleMap>
    </Box>
  );
});

TrailMap.displayName = "TrailMap";

export default TrailMap;
