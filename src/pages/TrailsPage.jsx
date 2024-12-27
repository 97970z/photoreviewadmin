import { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Tab,
  Tabs,
  Paper,
  Grid,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import { useJsApiLoader } from "@react-google-maps/api";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import StatisticsCard from "../components/Trails/StatisticsCard";
import HeatmapCard from "../components/Trails/HeatmapCard";
import TrailStatistics from "../components/Trails/TrailStatistics";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MapIcon from "@mui/icons-material/Map";
import TrailMap from "../components/Trails/TrailMap";

const TrailsPage = () => {
  const [trails, setTrails] = useState([]);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [selectedPersonName, setSelectedPersonName] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [selectedMapKey, setSelectedMapKey] = useState(Date.now());

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["visualization"],
  });

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePersonSelect = (personName) => {
    setSelectedPersonName(personName);
    setSelectedTrail(null);
  };

  const handleTrailSelect = (trail) => {
    setSelectedTrail(trail);
  };

  const refreshTrails = async () => {
    const trailsCollection = collection(db, "trails");
    const trailSnapshot = await getDocs(trailsCollection);
    const trailList = trailSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));
    setTrails(trailList);
  };

  const resetSelection = () => {
    setSelectedTrail(null);
    setSelectedPersonName("");
    setSelectedMapKey(Date.now());
  };

  const renderMapContainer = (trailsData, title, showReset = false) => (
    <Paper
      elevation={3}
      sx={{
        height: "100%",
        minHeight: 500,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <MapIcon color="primary" />
          <Typography variant="h6" color="primary">
            {title}
          </Typography>
        </Stack>
        {showReset && (selectedPersonName || selectedTrail) && (
          <Button
            startIcon={<RestartAltIcon />}
            onClick={resetSelection}
            variant="outlined"
            size="small"
          >
            초기화
          </Button>
        )}
      </Box>
      <TrailMap
        isLoaded={isLoaded}
        trails={trailsData}
        mapKey={showReset ? selectedMapKey : undefined}
      />
    </Paper>
  );

  const getSelectedTrails = () => {
    if (selectedTrail) {
      return [selectedTrail];
    }
    return [];
  };

  const getMapTitle = () => {
    if (selectedTrail) {
      return `${selectedTrail.name}님의 ${new Date(
        selectedTrail.timestamp
      ).toLocaleDateString()} 산책로`;
    }
    if (selectedPersonName) {
      return `${selectedPersonName}님의 산책로 선택`;
    }
    return "선택된 산책로";
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          산책로 분석
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{
            "& .MuiTabs-indicator": {
              height: 3,
            },
          }}
        >
          <Tab label="산책로 지도" />
          <Tab label="통계" />
          <Tab label="히트맵" />
        </Tabs>
      </Paper>

      <Box sx={{ display: tabValue === 0 ? "block" : "none" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderMapContainer(trails, "전체 산책로")}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderMapContainer(getSelectedTrails(), getMapTitle(), true)}
          </Grid>
          {trails && trails.length > 0 && (
            <Grid item xs={12}>
              <StatisticsCard
                trails={trails}
                onPersonSelect={handlePersonSelect}
                onTrailSelect={handleTrailSelect}
                onTrailDeleted={refreshTrails}
                selectedPersonName={selectedPersonName}
                selectedTrail={selectedTrail}
              />
            </Grid>
          )}
        </Grid>
      </Box>
      <Box sx={{ display: tabValue === 2 ? "block" : "none" }}>
        <HeatmapCard
          trails={trails}
          onPersonSelect={handlePersonSelect}
          onTrailSelect={handleTrailSelect}
          onTrailDeleted={refreshTrails}
          selectedPersonName={selectedPersonName}
          selectedTrail={selectedTrail}
        />
      </Box>
      <Box sx={{ display: tabValue === 1 ? "block" : "none" }}>
        <TrailStatistics
          trails={getSelectedTrails().length > 0 ? getSelectedTrails() : trails}
        />
      </Box>
    </Container>
  );
};

export default TrailsPage;
