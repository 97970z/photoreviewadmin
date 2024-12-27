/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { deleteTrail } from "../../services/firebase";
import {
  Typography,
  Paper,
  Grid2,
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
  Collapse,
} from "@mui/material";
import {
  DirectionsWalk as WalkIcon,
  Place as PlaceIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  KeyboardArrowRight as ArrowIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";

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

const formatTimeOnly = (timestamp) => {
  if (!timestamp) return "시간 정보 없음";
  const date = timestamp instanceof Date ? timestamp : timestamp?.toDate();
  return date?.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "시간 정보 없음";
  const start = startTime instanceof Date ? startTime : startTime?.toDate();
  const end = endTime instanceof Date ? endTime : endTime?.toDate();
  const durationMs = end - start;
  const minutes = Math.floor(durationMs / (1000 * 60));
  return `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
};

const formatDistance = (distance) => {
  if (typeof distance !== "number") return "거리 정보 없음";
  return `${distance.toFixed(2)}km`;
};

const calculateSteps = (distanceKm) => {
  const averageStrideLength = 0.7;
  const distanceMeters = distanceKm * 1000;
  return Math.round(distanceMeters / averageStrideLength);
};

const calculateCalories = (distanceKm, durationMinutes) => {
  const MET = 3.5;
  const weightKg = 65;
  const hours = durationMinutes / 60;
  const calories = MET * weightKg * hours;
  return Math.round(calories);
};

const TrailDetail = ({ trail }) => {
  const startLocation = trail.path?.[0];
  const startTime =
    trail.startTime instanceof Date
      ? trail.startTime
      : trail.startTime?.toDate();
  const endLocation = trail.path?.[trail.path.length - 1];
  const endTime =
    trail.endTime instanceof Date ? trail.endTime : trail.endTime?.toDate();
  const durationMinutes =
    endTime && startTime ? Math.floor((endTime - startTime) / (1000 * 60)) : 0;

  const stats = {
    speed: ((trail.distance || 0) / (durationMinutes / 60)).toFixed(2),
    steps: calculateSteps(trail.distance || 0),
    calories: calculateCalories(trail.distance || 0, durationMinutes),
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="subtitle1" color="primary.main">
            {trail.name || "이름 없음"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
            <Typography variant="body2">
              {formatDate(trail.timestamp)}
            </Typography>
          </Box>

          <Paper elevation={1} sx={{ p: 2, bgcolor: "background.default" }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              시간 정보
            </Typography>
            <Grid2 container spacing={2}>
              <Grid2 item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  시작 시간
                </Typography>
                <Typography variant="body2">
                  {formatTimeOnly(trail.startTime)}
                </Typography>
              </Grid2>
              <Grid2 item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  종료 시간
                </Typography>
                <Typography variant="body2">
                  {formatTimeOnly(trail.endTime)}
                </Typography>
              </Grid2>
              <Grid2 item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  총 소요 시간
                </Typography>
                <Typography variant="body2">
                  {formatDuration(trail.startTime, trail.endTime)}
                </Typography>
              </Grid2>
            </Grid2>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, bgcolor: "background.default" }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              거리 정보
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <WalkIcon sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2">
                총 거리: {formatDistance(trail.distance)}
              </Typography>
            </Box>
            {startLocation && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PlaceIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2">
                  시작 위치: {startLocation._lat?.toFixed(6)},{" "}
                  {startLocation._long?.toFixed(6)}
                </Typography>
              </Box>
            )}
            {endLocation && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PlaceIcon sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2">
                  종료 위치: {endLocation._lat?.toFixed(6)},{" "}
                  {endLocation._long?.toFixed(6)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        운동 통계
      </Typography>
      <Grid2 container spacing={2}>
        {[
          {
            label: "평균 속도",
            value: `${stats.speed} km/h`,
            icon: <WalkIcon sx={{ color: "primary.main" }} />,
            tooltip: "이동 거리와 시간을 기반으로 계산된 평균 속도",
          },
          {
            label: "예상 걸음 수",
            value: stats.steps.toLocaleString(),
            icon: <WalkIcon sx={{ color: "secondary.main" }} />,
            tooltip: "평균 보폭(0.7m) 기준으로 계산된 예상 걸음 수",
          },
          {
            label: "예상 소모 칼로리",
            value: `${stats.calories} kcal`,
            icon: <WalkIcon sx={{ color: "success.main" }} />,
            tooltip: "평균 체중(65kg) 및 중간 강도 운동 기준 예상 소모 칼로리",
          },
        ].map((stat, index) => (
          <Grid2 key={index} item xs={12} sm={4}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.default",
                "&:hover": {
                  bgcolor: "background.paper",
                  transform: "translateY(-2px)",
                  transition: "all 0.2s ease-in-out",
                },
              }}
            >
              {stat.icon}
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                sx={{ mt: 1, mb: 0.5 }}
              >
                {stat.label}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: "medium", color: "text.primary" }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                sx={{
                  mt: 1,
                  fontSize: "0.7rem",
                  fontStyle: "italic",
                }}
              >
                {stat.tooltip}
              </Typography>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

const StatisticsCard = ({
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

  return (
    <>
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
                          secondary={`${formatDistance(
                            trail.distance
                          )} • ${formatDuration(
                            trail.startTime,
                            trail.endTime
                          )}`}
                          primaryTypographyProps={{ variant: "body2" }}
                          secondaryTypographyProps={{ variant: "caption" }}
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

        <Box
          sx={{
            flex: 1,
            transition: "all 0.3s ease-in-out",
            transform: selectedTrail ? "translateX(0)" : "translateX(100%)",
            opacity: selectedTrail ? 1 : 0,
            bgcolor: "background.default",
          }}
        >
          {selectedTrail ? (
            <TrailDetail trail={selectedTrail} />
          ) : (
            <Box
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                산책로를 선택하세요
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
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

export default StatisticsCard;
