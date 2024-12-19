/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import { Box, Paper, Typography, Card, CardContent, Grid } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import _ from "lodash";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import TimelineIcon from "@mui/icons-material/Timeline";
import SpeedIcon from "@mui/icons-material/Speed";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const COLORS = {
  primary: "#1976d2",
  secondary: "#dc004e",
  success: "#4caf50",
  warning: "#ff9800",
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "primary",
}) => (
  <Card
    sx={{
      height: "100%",
      transition: "all 0.3s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: 3,
      },
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Icon sx={{ color: `${color}.main`, mr: 1 }} />
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const ChartContainer = ({ title, children }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      height: "100%",
      transition: "all 0.3s",
      "&:hover": {
        boxShadow: 3,
      },
    }}
  >
    <Typography variant="h6" gutterBottom color="textSecondary">
      {title}
    </Typography>
    {children}
  </Paper>
);

const TrailStatistics = ({ trails }) => {
  const statistics = useMemo(() => {
    const getDate = (timestamp) => {
      if (!timestamp) return new Date();
      if (timestamp instanceof Date) return timestamp;
      if (typeof timestamp.toDate === "function") return timestamp.toDate();
      return new Date(timestamp);
    };

    const dailyWalks = _.groupBy(trails, (trail) =>
      format(getDate(trail.timestamp), "yyyy-MM-dd")
    );

    const walksByDate = Object.entries(dailyWalks)
      .map(([date, walks]) => ({
        date,
        count: walks.length,
        totalDistance: _.sumBy(walks, "distance"),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const hourlyDistribution = _.countBy(trails, (trail) => {
      const startTime = getDate(trail.startTime);
      return startTime.getHours();
    });

    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}시`,
      count: hourlyDistribution[hour] || 0,
    }));

    const totalDistance = _.sumBy(trails, "distance");
    const averageDistance = totalDistance / trails.length;

    const walkDurations = trails.map((trail) => {
      const start = getDate(trail.startTime);
      const end = getDate(trail.endTime);
      return start && end ? (end - start) / (1000 * 60) : 0;
    });
    const averageDuration = _.mean(walkDurations);

    return {
      walksByDate,
      hourlyData,
      averageDistance,
      averageDuration,
      totalDistance,
      totalWalks: trails.length,
    };
  }, [trails]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="총 산책 횟수"
            value={statistics.totalWalks}
            subtitle="전체 기록된 산책 횟수"
            icon={DirectionsWalkIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="총 산책 거리"
            value={`${statistics.totalDistance.toFixed(1)}km`}
            subtitle="누적 산책 거리"
            icon={TimelineIcon}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="평균 산책 거리"
            value={`${statistics.averageDistance.toFixed(1)}km`}
            subtitle="산책당 평균 거리"
            icon={SpeedIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="평균 산책 시간"
            value={`${Math.round(statistics.averageDuration)}분`}
            subtitle="산책당 평균 소요 시간"
            icon={AccessTimeIcon}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartContainer title="일별 산책 통계">
            <Box sx={{ height: 400, width: "100%" }}>
              <ResponsiveContainer>
                <LineChart data={statistics.walksByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), "MM/dd")}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={COLORS.primary}
                    name="산책 횟수"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalDistance"
                    stroke={COLORS.secondary}
                    name="총 거리(km)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </ChartContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartContainer title="시간대별 산책 분포">
            <Box sx={{ height: 400, width: "100%" }}>
              <ResponsiveContainer>
                <BarChart data={statistics.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill={COLORS.primary}
                    name="산책 횟수"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrailStatistics;
