/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Typography, Paper, Grid } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StatisticsCard = ({ trails }) => {
  const [statistics, setStatistics] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    calculateStatistics(trails);
    generateMonthlyData(trails);
  }, [trails]);

  const calculateStatistics = (trailList) => {
    const totalDistance = trailList.reduce(
      (sum, trail) => sum + (trail.distance || 0),
      0
    );
    const averageDistance = totalDistance / trailList.length;

    setStatistics({
      totalTrails: trailList.length,
      totalDistance,
      averageDistance,
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

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        통계
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle1">총 산책로 수</Typography>
          <Typography variant="h4">{statistics.totalTrails}</Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle1">총 거리</Typography>
          <Typography variant="h4">
            {statistics.totalDistance?.toFixed(2)}m
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle1">평균 거리</Typography>
          <Typography variant="h4">
            {statistics.averageDistance?.toFixed(2)}m
          </Typography>
        </Grid>
      </Grid>
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
    </Paper>
  );
};

export default StatisticsCard;
