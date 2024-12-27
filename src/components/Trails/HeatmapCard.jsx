/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import { deleteTrail } from "../../services/firebase";
import {
  Typography,
  Paper,
  Grid,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  ListItemAvatar,
  Avatar,
  useTheme,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Stack,
  Collapse,
} from "@mui/material";
import {
  Person as PersonIcon,
  KeyboardArrowRight as ArrowIcon,
  RestartAlt as RestartAltIcon,
  Map as MapIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
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

const formatDate = (timestamp) => {
  if (!timestamp) return "날짜 정보 없음";
  const date = timestamp instanceof Date ? timestamp : timestamp?.toDate();
  return date?.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

const formatDistance = (distance) => {
  if (typeof distance !== "number") return "거리 정보 없음";
  return `${distance.toFixed(2)}km`;
};

const HeatMap = ({ trails, isLoaded, title, showReset, onReset }) => {
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [heatmapData, setHeatmapData] = useState([]);

  const onLoad = useCallback((map) => {
    setMap(map);
    setMapLoaded(true);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setMapLoaded(false);
  }, []);

  useEffect(() => {
    if (isLoaded && trails?.length > 0 && mapLoaded) {
      const points = trails.flatMap(
        (trail) =>
          trail.path?.map(
            (point) => new window.google.maps.LatLng(point._lat, point._long)
          ) || []
      );
      setHeatmapData(points);

      if (map) {
        const bounds = new window.google.maps.LatLngBounds();
        points.forEach((point) => bounds.extend(point));
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
        }
      }
    } else {
      setHeatmapData([]);
    }
  }, [isLoaded, trails, mapLoaded, map]);

  return (
    <Paper
      elevation={3}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
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
        {showReset && trails?.length > 0 && (
          <Button
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            variant="outlined"
            size="small"
          >
            초기화
          </Button>
        )}
      </Box>
      <Box sx={{ flexGrow: 1, p: 1 }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
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
            {mapLoaded && heatmapData.length > 0 && (
              <HeatmapLayer
                data={heatmapData}
                options={{
                  radius: 15,
                  opacity: 0.8,
                  maxIntensity: 10,
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <Typography>Loading map...</Typography>
        )}
      </Box>
    </Paper>
  );
};

const HeatmapCard = ({
  trails,
  onPersonSelect,
  onTrailSelect,
  onTrailDeleted,
  selectedPersonName,
  selectedTrail,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trailToDelete, setTrailToDelete] = useState(null);
  const [expandedPerson, setExpandedPerson] = useState(null);
  const [trailsByPerson, setTrailsByPerson] = useState({});
  const theme = useTheme();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["visualization"],
  });

  useEffect(() => {
    const groupedTrails = (trails || []).reduce((acc, trail) => {
      const name = trail.name || "이름 없음";
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(trail);
      return acc;
    }, {});

    Object.keys(groupedTrails).forEach((name) => {
      groupedTrails[name].sort((a, b) => {
        const dateA =
          a.timestamp instanceof Date ? a.timestamp : a.timestamp?.toDate();
        const dateB =
          b.timestamp instanceof Date ? b.timestamp : b.timestamp?.toDate();
        return dateB - dateA;
      });
    });

    setTrailsByPerson(groupedTrails);
  }, [trails]);

  const handlePersonClick = (personName) => {
    if (selectedPersonName === personName) {
      onPersonSelect(null);
      setExpandedPerson(null);
    } else {
      onPersonSelect(personName);
      setExpandedPerson(personName);
    }
    onTrailSelect(null);
  };

  const handleTrailClick = (trail) => {
    onTrailSelect(trail);
  };

  const handleDeleteClick = (e, trail) => {
    e.stopPropagation();
    setTrailToDelete(trail);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (trailToDelete) {
      const success = await deleteTrail(trailToDelete.id);
      if (success) {
        // 삭제 후 목록 새로고침을 위해 부모 컴포넌트에서 trails를 다시 불러오는 함수 호출
        onTrailDeleted();
        if (selectedTrail?.id === trailToDelete.id) {
          onTrailSelect(null);
        }
      }
    }
    setDeleteDialogOpen(false);
    setTrailToDelete(null);
  };

  const resetSelection = () => {
    onPersonSelect(null);
    onTrailSelect(null);
    setExpandedPerson(null);
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <HeatMap
              trails={trails}
              isLoaded={isLoaded}
              title="전체 산책로 히트맵"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <HeatMap
              trails={selectedTrail ? [selectedTrail] : []}
              isLoaded={isLoaded}
              title={
                selectedTrail
                  ? `${selectedTrail.name}님의 산책로 히트맵`
                  : "선택된 산책로 히트맵"
              }
              showReset={true}
              onReset={resetSelection}
            />
          </Grid>
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{
                minHeight: "600px",
                display: "flex",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: "400px",
                  borderRight: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    p: 2,
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                  }}
                >
                  산책로 기록
                </Typography>
                <List sx={{ overflow: "auto", flex: 1 }}>
                  {Object.entries(trailsByPerson).map(
                    ([personName, personTrails]) => (
                      <Box key={personName}>
                        <ListItem
                          button
                          onClick={() => handlePersonClick(personName)}
                          sx={{
                            bgcolor:
                              selectedPersonName === personName
                                ? "action.selected"
                                : "inherit",
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={personName}
                            secondary={`총 ${personTrails.length}개의 산책로`}
                          />
                          <IconButton
                            sx={{
                              transform:
                                expandedPerson === personName
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              transition: "transform 0.3s",
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </ListItem>
                        <Collapse in={expandedPerson === personName}>
                          {personTrails.map((trail) => (
                            <ListItemButton
                              key={trail.id}
                              onClick={() => handleTrailClick(trail)}
                              selected={selectedTrail?.id === trail.id}
                              sx={{
                                pl: 6,
                                position: "relative",
                                "&.Mui-selected": {
                                  bgcolor: "primary.light",
                                  "&:hover": {
                                    bgcolor: "primary.light",
                                  },
                                },
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={(e) => handleDeleteClick(e, trail)}
                                sx={{
                                  mr: 1,
                                  color: "error.main",
                                  "&:hover": {
                                    backgroundColor: "error.light",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <ListItemText
                                primary={formatDate(trail.timestamp)}
                                secondary={formatDistance(trail.distance)}
                                primaryTypographyProps={{ variant: "body2" }}
                                secondaryTypographyProps={{
                                  variant: "caption",
                                }}
                              />
                              <IconButton
                                size="small"
                                sx={{
                                  position: "absolute",
                                  right: 8,
                                  transform:
                                    selectedTrail?.id === trail.id
                                      ? "rotate(90deg)"
                                      : "none",
                                  transition: "transform 0.3s ease-in-out",
                                }}
                              >
                                <ArrowIcon />
                              </IconButton>
                            </ListItemButton>
                          ))}
                        </Collapse>
                        <Divider />
                      </Box>
                    )
                  )}
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>산책로 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {trailToDelete &&
              `${formatDate(
                trailToDelete.timestamp
              )}의 산책로를 삭제하시겠습니까?`}
            <br />이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HeatmapCard;
