/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  DirectionsWalk as WalkIcon,
  Place as PlaceIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  KeyboardArrowRight as ArrowIcon,
} from "@mui/icons-material";

// 타임스탬프를 Date 객체로 변환하는 헬퍼 함수
const convertToDate = (timestamp) => {
  if (!timestamp) return null;

  // 이미 Date 객체인 경우
  if (timestamp instanceof Date) return timestamp;

  // Firestore Timestamp 객체인 경우
  if (timestamp?.toDate instanceof Function) return timestamp.toDate();

  // seconds와 nanoseconds를 가진 객체인 경우
  if (timestamp?.seconds) return new Date(timestamp.seconds * 1000);

  // timestamp가 숫자(밀리초)인 경우
  if (typeof timestamp === "number") return new Date(timestamp);

  return null;
};

// 날짜 포맷팅 함수
const formatDate = (timestamp) => {
  const date = convertToDate(timestamp);
  if (!date) return "날짜 정보 없음";

  try {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "날짜 형식 오류";
  }
};

// 시간 포맷팅 헬퍼 함수
const formatTimeOnly = (timestamp) => {
  const date = convertToDate(timestamp);
  if (!date) return "시간 정보 없음";

  try {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Time formatting error:", error);
    return "시간 형식 오류";
  }
};

// 시간 차이 계산 함수
const formatDuration = (startTime, endTime) => {
  const start = convertToDate(startTime);
  const end = convertToDate(endTime);

  if (!start || !end) return "시간 정보 없음";

  try {
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes}분`;
  } catch (error) {
    console.error("Duration calculation error:", error);
    return "시간 계산 오류";
  }
};

// 거리 포맷팅 함수
const formatDistance = (distance) => {
  if (typeof distance !== "number") return "거리 정보 없음";
  return `${distance.toFixed(2)}km`;
};

// 걸음 수 계산 함수 (평균 보폭 기준)
const calculateSteps = (distanceKm) => {
  const averageStrideLength = 0.7; // 평균 보폭 0.7m
  const distanceMeters = distanceKm * 1000;
  return Math.round(distanceMeters / averageStrideLength);
};

// 칼로리 계산 함수 (MET 값 기준)
const calculateCalories = (distanceKm, durationMinutes) => {
  // 걷기의 MET 값 (중간 강도 = 3.5)
  const MET = 3.5;
  // 평균 체중 65kg 기준
  const weightKg = 65;
  // 칼로리 = MET * 체중(kg) * 시간(hour)
  const hours = durationMinutes / 60;
  const calories = MET * weightKg * hours;
  return Math.round(calories);
};

const TrailDetail = ({ trail }) => {
  const startLocation = trail.path?.[0];
  const startTime = convertToDate(trail.startTime);
  const endLocation = trail.path?.[trail.path.length - 1];
  const endTime = convertToDate(trail.endTime);
  const durationMinutes =
    endTime && startTime ? Math.floor((endTime - startTime) / (1000 * 60)) : 0;

  // 통계 계산
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
                sx={{
                  fontWeight: "medium",
                  color: "text.primary",
                }}
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

const StatisticsCard = ({ trails }) => {
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [trailsByPerson, setTrailsByPerson] = useState({});
  const theme = useTheme();

  useEffect(() => {
    try {
      const groupedTrails = trails.reduce((acc, trail) => {
        const name = trail.name || "이름 없음";
        if (!acc[name]) {
          acc[name] = [];
        }
        acc[name].push(trail);
        return acc;
      }, {});

      Object.keys(groupedTrails).forEach((name) => {
        groupedTrails[name].sort((a, b) => {
          const dateA = convertToDate(a.timestamp);
          const dateB = convertToDate(b.timestamp);
          return dateB - dateA;
        });
      });

      setTrailsByPerson(groupedTrails);
    } catch (error) {
      console.error("Error grouping trails:", error);
      setTrailsByPerson({});
    }
  }, [trails]);

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={2}
        sx={{
          minHeight: "600px",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* 왼쪽 리스트 */}
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
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={personName}
                      secondary={`총 ${personTrails.length}개의 산책로`}
                    />
                  </ListItem>
                  {personTrails.map((trail, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => setSelectedTrail(trail)}
                      selected={selectedTrail?.id === trail.id}
                      sx={{
                        pl: 6,
                        position: "relative",
                        transition: "all 0.2s ease-in-out",
                        "&.Mui-selected": {
                          bgcolor: "primary.light",
                          "&:hover": {
                            bgcolor: "primary.light",
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={formatDate(trail.timestamp)}
                        secondary={`${formatDistance(
                          trail.distance
                        )} • ${formatDuration(trail.startTime, trail.endTime)}`}
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
                  <Divider />
                </Box>
              )
            )}
          </List>
        </Box>

        {/* 오른쪽 상세 정보 */}
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
    </Box>
  );
};

export default StatisticsCard;
