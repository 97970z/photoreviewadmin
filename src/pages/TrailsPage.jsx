import React, { useState, useEffect, useCallback } from "react";
import { Typography, Container, Box, Tab, Tabs, Paper } from "@mui/material";
import { GoogleMap, useJsApiLoader, Polyline } from "@react-google-maps/api";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import StatisticsCard from "../components/Trails/StatisticsCard";
import HeatmapCard from "../components/Trails/HeatmapCard";

const center = {
  lat: 37.5186837,
  lng: 126.9219841,
};

const TrailsPage = () => {
  const [trails, setTrails] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["visualization"],
  });

  const [, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
    setMapLoaded(true);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
    setMapLoaded(false);
  }, []);

  useEffect(() => {
    const fetchTrails = async () => {
      const trailsCollection = collection(db, "trails");
      const trailSnapshot = await getDocs(trailsCollection);
      const trailList = trailSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      }));
      setTrails(trailList);
    };

    fetchTrails();
  }, []);

  const parseCoordinates = (coord) => {
    if (!coord) return null;
    if (typeof coord === "object" && "_lat" in coord && "_long" in coord) {
      return { lat: coord._lat, lng: coord._long };
    }
    return null;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        산책로 분석
      </Typography>
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="산책로 지도" />
          <Tab label="통계" />
          <Tab label="히트맵" />
        </Tabs>
      </Paper>
      <Box sx={{ display: tabValue === 0 ? "block" : "none" }}>
        <Paper elevation={3} sx={{ height: 500, p: 2 }}>
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={center}
              zoom={17}
              onLoad={onLoad}
              onUnmount={onUnmount}
            >
              {mapLoaded &&
                trails.map((trail) => {
                  const path = Array.isArray(trail.path)
                    ? trail.path.map(parseCoordinates).filter(Boolean)
                    : [];

                  return (
                    <React.Fragment key={trail.id}>
                      {path.length > 0 && (
                        <Polyline
                          path={path}
                          options={{
                            strokeColor: "#FF0000",
                            strokeOpacity: 1.0,
                            strokeWeight: 2,
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
            </GoogleMap>
          ) : (
            <Typography>Loading map...</Typography>
          )}
        </Paper>
      </Box>
      <Box sx={{ display: tabValue === 1 ? "block" : "none" }}>
        <StatisticsCard trails={trails} />
      </Box>
      <Box sx={{ display: tabValue === 2 ? "block" : "none" }}>
        <HeatmapCard trails={trails} />
      </Box>
    </Container>
  );
};

export default TrailsPage;
