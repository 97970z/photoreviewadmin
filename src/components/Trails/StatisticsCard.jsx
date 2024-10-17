/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Typography, Paper, Grid2, Box } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const StatisticsCard = ({ trails }) => {
  const [statistics, setStatistics] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [weekdayData, setWeekdayData] = useState([]);
  const [timeOfDayData, setTimeOfDayData] = useState([]);
  const [durationData, setDurationData] = useState([]);

  useEffect(() => {
    calculateStatistics(trails);
    generateMonthlyData(trails);
    generateWeekdayData(trails);
    generateTimeOfDayData(trails);
    generateDurationData(trails);
  }, [trails]);

  const calculateStatistics = (trailList) => {
    const totalDistance = trailList.reduce(
      (sum, trail) => sum + (trail.distance || 0),
      0
    );
    const totalDuration = trailList.reduce(
      (sum, trail) => sum + (trail.duration || 0),
      0
    );
    const validTrails = trailList.filter(
      (trail) => trail.distance > 0 && trail.duration > 0
    );
    const averageDistance = totalDistance / trailList.length;
    const averageDuration = totalDuration / trailList.length;

    const paces = validTrails
      .map((trail) => trail.distance / trail.duration)
      .filter((pace) => isFinite(pace) && pace > 0);
    const fastestPace = paces.length > 0 ? Math.max(...paces) : 0;
    const slowestPace = paces.length > 0 ? Math.min(...paces) : 0;

    setStatistics({
      totalTrails: trailList.length,
      totalDistance,
      averageDistance,
      totalDuration,
      averageDuration,
      fastestPace,
      slowestPace,
    });
  };

  const generateMonthlyData = (trailList) => {
    const monthlyDistances = trailList.reduce((acc, trail) => {
      const month = trail.timestamp.toLocaleString("default", {
        month: "short",
      });
      acc[month] = (acc[month] || 0) + (trail.distance || 0);
      return acc;
    }, {});

    setMonthlyData(
      Object.entries(monthlyDistances).map(([month, distance]) => ({
        month,
        distance,
      }))
    );
  };

  const generateWeekdayData = (trailList) => {
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekdayCounts = trailList.reduce((acc, trail) => {
      const weekday = weekdays[trail.timestamp.getDay()];
      acc[weekday] = (acc[weekday] || 0) + 1;
      return acc;
    }, {});

    setWeekdayData(
      weekdays.map((day) => ({
        name: day,
        count: weekdayCounts[day] || 0,
      }))
    );
  };

  const generateTimeOfDayData = (trailList) => {
    const timeOfDayCounts = trailList.reduce((acc, trail) => {
      const hour = trail.timestamp.getHours();
      let timeOfDay;
      if (hour >= 5 && hour < 12) timeOfDay = "아침";
      else if (hour >= 12 && hour < 17) timeOfDay = "오후";
      else if (hour >= 17 && hour < 21) timeOfDay = "저녁";
      else timeOfDay = "밤";
      acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
      return acc;
    }, {});

    setTimeOfDayData(
      Object.entries(timeOfDayCounts).map(([name, value]) => ({ name, value }))
    );
  };

  const generateDurationData = (trailList) => {
    const durationRanges = [
      { name: "0-15분", min: 0, max: 15 },
      { name: "15-30분", min: 15, max: 30 },
      { name: "30-60분", min: 30, max: 60 },
      { name: "60분 이상", min: 60, max: Infinity },
    ];

    const durationCounts = trailList.reduce((acc, trail) => {
      const duration = trail.duration / 60; // 분 단위로 변환
      const range = durationRanges.find(
        (r) => duration >= r.min && duration < r.max
      );
      if (range) {
        acc[range.name] = (acc[range.name] || 0) + 1;
      }
      return acc;
    }, {});

    setDurationData(
      durationRanges.map((range) => ({
        name: range.name,
        count: durationCounts[range.name] || 0,
      }))
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        통계
      </Typography>
      <Grid2 container spacing={3} sx={{ mb: 3 }}>
        <Grid2 item xs={12} sm={4}>
          <Typography variant="subtitle1">총 산책로 수</Typography>
          <Typography variant="h4">{statistics.totalTrails}</Typography>
        </Grid2>
        <Grid2 item xs={12} sm={4}>
          <Typography variant="subtitle1">총 거리</Typography>
          <Typography variant="h4">
            {statistics.totalDistance?.toFixed(2)}m
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sm={4}>
          <Typography variant="subtitle1">평균 거리</Typography>
          <Typography variant="h4">
            {statistics.averageDistance?.toFixed(2)}m
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sm={4}>
          <Typography variant="subtitle1">총 산책 시간</Typography>
          <Typography variant="h4">
            {Math.floor(statistics.totalDuration / 60)}분
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sm={4}>
          <Typography variant="subtitle1">평균 산책 시간</Typography>
          <Typography variant="h4">
            {Math.floor(statistics.averageDuration / 60)}분
          </Typography>
        </Grid2>
        <Grid2 item xs={12} sm={4}>
          <Typography variant="subtitle1">가장 빠른 페이스</Typography>
          <Typography variant="h4">
            {statistics.fastestPace
              ? `${statistics.fastestPace.toFixed(2)}m/s`
              : "N/A"}
          </Typography>
        </Grid2>
      </Grid2>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          월별 산책 거리
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="distance" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          요일별 산책 횟수
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weekdayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Grid2 container spacing={4}>
        <Grid2 item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            시간대별 산책 분포
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={timeOfDayData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {timeOfDayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Grid2>
        <Grid2 item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            산책 시간 분포
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={durationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {durationData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Grid2>
      </Grid2>
    </Paper>
  );
};

export default StatisticsCard;
